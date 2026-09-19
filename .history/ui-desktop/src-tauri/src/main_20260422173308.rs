#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, sync::Mutex};

use core_engine::crdt::{self, LamportClock, NodePayload, OpKind, Operation};
use core_engine::plugin_manager::{scan_plugins, PluginManifest};
use pyo3::{prelude::*, types::PyList};
use serde_json::json;
use tauri::{Manager, State, Window};
use tauri::Emitter;
use uuid::Uuid;

struct EngineReplicaState {
    peer_id: Uuid,
    clock: LamportClock,
    ops_log: Vec<Operation>,
}

struct EngineBridgeState {
    // Keep only replicated operations in this app shell; CRDT logic stays in core-engine.
    inner: Mutex<EngineReplicaState>,
}

fn extract_insert_payload(ops: &[Operation]) -> Option<String> {
    ops.iter().find_map(|op| match &op.kind {
        OpKind::InsertNode { payload, .. } => payload
            .content
            .as_ref()
            .map(|content| content.to_string())
            .or_else(|| Some(payload.label.clone())),
        _ => None,
    })
}

fn emit_graph_updated(window: &Window, kind: &str, op_ids: Vec<String>) -> Result<(), String> {
    let payload = json!({ "kind": kind, "op_ids": op_ids });
    window
        .emit("graph-updated", payload)
        .map_err(|err| format!("failed to emit graph-updated: {err}"))
}

fn agent_runtime_src_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../agent-runtime/src")
}

#[tauri::command]
fn fetch_graph_state(state: State<'_, EngineBridgeState>) -> Result<crdt::GraphSnapshot, String> {
    let bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    Ok(crdt::merge(&bridge.ops_log, &[]).snapshot())
}

#[tauri::command]
fn ingest_real_data(
    window: Window,
    state: State<'_, EngineBridgeState>,
    raw_text: String,
) -> Result<(), String> {
    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let mut ops = core_engine::data_ingestion::ingest_ascii_data(&raw_text, bridge.peer_id);
    for op in &mut ops {
        op.peer = bridge.peer_id;
        op.ts = bridge.clock.tick();
    }

    let insert_payload = extract_insert_payload(&ops);
    let op_ids: Vec<String> = ops.iter().map(|op| op.id.to_string()).collect();
    bridge.ops_log.extend(ops);
    drop(bridge);

    if let Some(payload) = insert_payload {
        window
            .emit("graph-updated", payload)
            .map_err(|err| format!("failed to emit graph-updated: {err}"))?;
    } else {
        let fallback_payload = json!({ "op_ids": op_ids });
        window
            .emit("graph-updated", fallback_payload)
            .map_err(|err| format!("failed to emit graph-updated: {err}"))?;
    }

    let _ = window.app_handle();
    Ok(())
}

#[tauri::command]
fn analyze_cv_data(voltages: Vec<f64>, currents: Vec<f64>) -> Result<serde_json::Value, String> {
    match core_engine::run_peak_analysis(voltages, currents) {
        Some((index, voltage, current)) => Ok(json!({
            "index": index,
            "voltage": voltage,
            "current": current
        })),
        None => Err("分析失敗或資料格式錯誤".to_string()),
    }
}

#[tauri::command]
fn run_analysis_module(
    module_id: String,
    params: String,
    data: Option<String>,
) -> Result<String, String> {
    Python::with_gil(|py| -> PyResult<String> {
        let sys = PyModule::import_bound(py, "sys")?;
        let path = sys.getattr("path")?.downcast_into::<PyList>()?;
        let runtime_src = agent_runtime_src_dir();
        path.insert(0, runtime_src.to_string_lossy().as_ref())?;

        let analysis = PyModule::import_bound(py, "agent_runtime.analysis")?;
        let result = analysis
            .getattr("run_module")?
            .call1((module_id, params, data.unwrap_or_else(|| "{}".to_string())))?;
        result.extract::<String>()
    })
    .map_err(|err| err.to_string())
}

#[tauri::command]
fn get_available_plugins() -> Result<Vec<PluginManifest>, String> {
    let tauri_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let candidate_dirs = [
        tauri_dir.join("../plugins"),
        tauri_dir.join("../../plugins"),
    ];

    for dir in candidate_dirs {
        if dir.is_dir() {
            return Ok(scan_plugins(&dir));
        }
    }

    Ok(Vec::new())
}

#[tauri::command]
fn commit_agent_analysis(
    window: Window,
    state: State<'_, EngineBridgeState>,
    peak_index: usize,
    voltage: f64,
    current: f64,
) -> Result<(), String> {
    use std::collections::BTreeMap;

    let mut properties = BTreeMap::new();
    properties.insert("type".to_string(), "agent_analysis".to_string());
    properties.insert("method".to_string(), "find_max_peak".to_string());
    let result_json = json!({ "index": peak_index, "v": voltage, "c": current });
    properties.insert("result".to_string(), result_json.to_string());

    let mut payload = NodePayload::with_content("AgentAnalysisResult", result_json);
    payload.properties = properties;

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let node_id = Uuid::new_v4();
    let op_analysis = Operation::new(
        OpKind::InsertNode { node_id, payload },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let prev_node_id = bridge.ops_log.iter().rev().find_map(|op| match &op.kind {
            OpKind::InsertNode { node_id, .. } => Some(*node_id),
            _ => None,
        });

    let op_link = if let Some(prev_id) = prev_node_id {
        Some(Operation::new(
            OpKind::LinkNodes {
                edge_id: Uuid::new_v4(),
                from: node_id,
                to: prev_id,
                label: "derived_from".to_string(),
            },
            bridge.clock.tick(),
            bridge.peer_id,
        ))
    } else {
        None
    };

    bridge.ops_log.push(op_analysis.clone());
    if let Some(op_link) = &op_link {
        bridge.ops_log.push(op_link.clone());
    }
    drop(bridge);

    let mut op_ids = vec![op_analysis.id.to_string()];
    if let Some(op_link) = &op_link {
        op_ids.push(op_link.id.to_string());
    }

    emit_graph_updated(&window, "analysis_commit", op_ids)?;
    Ok(())
}

#[tauri::command]
fn create_note_node(
    window: Window,
    state: State<'_, EngineBridgeState>,
    title: Option<String>,
    content: Option<String>,
) -> Result<String, String> {
    let trimmed_title = title
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("Untitled Note");
    let note_content = content.unwrap_or_default();

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let node_id = Uuid::new_v4();
    let op = Operation::new(
        OpKind::InsertNode {
            node_id,
            payload: NodePayload::note(trimmed_title, note_content),
        },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let op_id = op.id.to_string();
    bridge.ops_log.push(op);
    drop(bridge);

    emit_graph_updated(&window, "graph_changed", vec![op_id])?;
    Ok(node_id.to_string())
}

#[tauri::command]
fn import_raw_file(
    window: Window,
    state: State<'_, EngineBridgeState>,
    source_path: String,
) -> Result<String, String> {
    use std::collections::BTreeMap;
    use std::path::Path;

    let metadata = core_engine::blob_storage::ingest_file(Path::new(&source_path))?;

    let mut properties = BTreeMap::new();
    properties.insert("type".to_string(), "file".to_string());
    properties.insert("title".to_string(), metadata.original_name.clone());
    properties.insert("hash".to_string(), metadata.hash.clone());
    properties.insert("extension".to_string(), metadata.extension.clone());
    properties.insert("size".to_string(), metadata.size_bytes.to_string());

    let content = json!({
        "title": metadata.original_name,
        "hash": metadata.hash,
        "extension": metadata.extension,
        "size": metadata.size_bytes,
    });

    let mut payload = NodePayload::with_content("file", content);
    payload.properties = properties;

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let node_id = Uuid::new_v4();
    let op = Operation::new(
        OpKind::InsertNode { node_id, payload },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let op_id = op.id.to_string();
    bridge.ops_log.push(op);
    drop(bridge);

    emit_graph_updated(&window, "graph_changed", vec![op_id])?;
    Ok(node_id.to_string())
}

#[tauri::command]
fn update_note_node(
    window: Window,
    state: State<'_, EngineBridgeState>,
    node_id: String,
    title: String,
    content: String,
) -> Result<(), String> {
    let node_id = Uuid::parse_str(&node_id).map_err(|err| format!("invalid node id: {err}"))?;
    let trimmed_title = if title.trim().is_empty() {
        "Untitled Note"
    } else {
        title.trim()
    };

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let op = Operation::new(
        OpKind::UpdateNode {
            node_id,
            payload: NodePayload::note(trimmed_title, content),
        },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let op_id = op.id.to_string();
    bridge.ops_log.push(op);
    drop(bridge);

    emit_graph_updated(&window, "graph_changed", vec![op_id])?;
    Ok(())
}

#[tauri::command]
fn delete_node(
    window: Window,
    state: State<'_, EngineBridgeState>,
    node_id: String,
) -> Result<(), String> {
    let node_id = Uuid::parse_str(&node_id).map_err(|err| format!("invalid node id: {err}"))?;

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let graph = crdt::merge(&bridge.ops_log, &[]);
    if !graph.nodes.contains_key(&node_id) {
        return Err("node not found".to_string());
    }

    let op = Operation::new(
        OpKind::DeleteNode { node_id },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let op_id = op.id.to_string();
    bridge.ops_log.push(op);
    drop(bridge);

    emit_graph_updated(&window, "graph_changed", vec![op_id])?;
    Ok(())
}

#[tauri::command]
fn link_nodes(
    window: Window,
    state: State<'_, EngineBridgeState>,
    from_id: String,
    to_id: String,
    label: Option<String>,
) -> Result<(), String> {
    let from = Uuid::parse_str(&from_id).map_err(|err| format!("invalid from node id: {err}"))?;
    let to = Uuid::parse_str(&to_id).map_err(|err| format!("invalid to node id: {err}"))?;
    if from == to {
        return Err("cannot link a node to itself".to_string());
    }

    let mut bridge = state
        .inner
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    let op = Operation::new(
        OpKind::LinkNodes {
            edge_id: Uuid::new_v4(),
            from,
            to,
            label: label.unwrap_or_else(|| "manual_link".to_string()),
        },
        bridge.clock.tick(),
        bridge.peer_id,
    );

    let op_id = op.id.to_string();
    bridge.ops_log.push(op);
    drop(bridge);

    emit_graph_updated(&window, "graph_changed", vec![op_id])?;
    Ok(())
}

fn main() {
    pyo3::prepare_freethreaded_python();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(EngineBridgeState {
            inner: Mutex::new(EngineReplicaState {
                peer_id: Uuid::new_v4(),
                clock: LamportClock::new(),
                ops_log: Vec::new(),
            }),
        })
        .invoke_handler(tauri::generate_handler![
            fetch_graph_state,
            ingest_real_data,
            analyze_cv_data,
            get_available_plugins,
            run_analysis_module,
            commit_agent_analysis,
            create_note_node,
            import_raw_file,
            update_note_node,
            delete_node,
            link_nodes
        ])
        .run(tauri::generate_context!())
        .expect("error while running LabFlow desktop shell");
}
