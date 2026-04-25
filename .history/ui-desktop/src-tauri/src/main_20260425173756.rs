#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, sync::Mutex, time::{SystemTime, UNIX_EPOCH}};

use core_engine::crdt::{self, LamportClock, NodePayload, OpKind, Operation};
use core_engine::plugin_manager::{execute_plugin, scan_plugins, PluginManifest};
use pyo3::{prelude::*, types::PyList};
use rusqlite::{params, OptionalExtension};
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

struct DbState {
    conn: Mutex<rusqlite::Connection>,
}

fn hydrate_file_node_json(
    id: String,
    node_type: String,
    blob_hash: Option<String>,
    properties_raw: String,
    is_aligned: i64,
    created_at: Option<i64>,
    updated_at: Option<i64>,
) -> serde_json::Value {
    let mut properties = serde_json::from_str::<serde_json::Value>(&properties_raw)
        .unwrap_or_else(|_| json!({}));

    if !properties.is_object() {
        properties = json!({});
    }

    if let Some(obj) = properties.as_object_mut() {
        obj.insert("id".to_string(), json!(id));
        obj.insert("node_type".to_string(), json!(node_type));
        obj.insert("blob_hash".to_string(), json!(blob_hash));
        obj.insert("is_aligned".to_string(), json!(is_aligned != 0));
        obj.insert("created_at".to_string(), json!(created_at));
        obj.insert("updated_at".to_string(), json!(updated_at));
    }

    properties
}

fn current_unix_ts() -> Result<i64, String> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| format!("failed to get system time: {err}"))?;
    i64::try_from(duration.as_secs()).map_err(|err| format!("timestamp overflow: {err}"))
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
fn run_plugin_sandbox(
    plugin_id: String,
    params: String,
    blob_hash: Option<String>,
) -> Result<String, String> {
    let tauri_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let candidate_dirs = [
        tauri_dir.join("../plugins"),
        tauri_dir.join("../../plugins"),
    ];

    for dir in candidate_dirs {
        if !dir.is_dir() {
            continue;
        }

        let plugins = scan_plugins(&dir);
        if let Some(plugin) = plugins.into_iter().find(|item| item.id == plugin_id) {
            return execute_plugin(&plugin, &params, blob_hash.as_deref());
        }
    }

    Err(format!("plugin not found: {plugin_id}"))
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
    db_state: State<'_, DbState>,
    source_path: String,
) -> Result<String, String> {
    use std::path::Path;

    let metadata = core_engine::blob_storage::ingest_file(Path::new(&source_path))?;
    let node_id = Uuid::new_v4().to_string();
    let now_ts = current_unix_ts()?;

    let properties = json!({
        "title": metadata.original_name,
        "extension": metadata.extension,
        "size": metadata.size_bytes,
    });
    let properties_str = serde_json::to_string(&properties)
        .map_err(|err| format!("failed to serialize node properties: {err}"))?;

    let conn = db_state
        .conn
        .lock()
        .map_err(|_| "failed to acquire sqlite connection lock".to_string())?;

    conn.execute(
        "INSERT INTO nodes (id, node_type, blob_hash, properties, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        params![
            node_id,
            "file",
            metadata.hash,
            properties_str,
            now_ts,
            now_ts,
        ],
    )
    .map_err(|err| format!("failed to insert node into sqlite: {err}"))?;
    drop(conn);

    emit_graph_updated(&window, "graph_changed", vec![node_id.clone()])?;
    Ok(node_id)
}

#[tauri::command]
fn read_blob_bytes(hash: String) -> Result<Vec<u8>, String> {
    core_engine::blob_storage::read_blob(&hash)
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

#[tauri::command]
fn update_file_metadata(
    window: Window,
    db_state: State<'_, DbState>,
    node_id: String,
    tags: Vec<String>,
    remark: String,
) -> Result<(), String> {
    let conn = db_state
        .conn
        .lock()
        .map_err(|_| "failed to acquire sqlite connection lock".to_string())?;

    let raw_properties: Option<String> = conn
        .query_row(
            "SELECT properties FROM nodes WHERE id = ?",
            params![&node_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|err| format!("failed to query node properties: {err}"))?;

    let raw_properties = raw_properties.ok_or_else(|| "node not found".to_string())?;
    let mut properties = serde_json::from_str::<serde_json::Value>(&raw_properties)
        .unwrap_or_else(|_| json!({}));

    if !properties.is_object() {
        properties = json!({});
    }

    if let Some(obj) = properties.as_object_mut() {
        obj.insert("tags".to_string(), json!(tags));
        obj.insert("remark".to_string(), json!(remark));
    }

    let merged_properties = serde_json::to_string(&properties)
        .map_err(|err| format!("failed to serialize merged properties: {err}"))?;

    conn.execute(
        "UPDATE nodes SET properties = ? WHERE id = ?",
        params![merged_properties, &node_id],
    )
    .map_err(|err| format!("failed to update node metadata: {err}"))?;
    drop(conn);

    emit_graph_updated(&window, "metadata_updated", vec![node_id])?;
    Ok(())
}

#[tauri::command]
fn list_files(
    db_state: State<'_, DbState>,
    offset: u32,
    limit: u32,
) -> Result<Vec<serde_json::Value>, String> {
    let conn = db_state
        .conn
        .lock()
        .map_err(|_| "failed to acquire sqlite connection lock".to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, node_type, blob_hash, properties, created_at, updated_at, is_aligned \
             FROM nodes \
             WHERE node_type = 'file' \
             ORDER BY created_at DESC \
             LIMIT ? OFFSET ?",
        )
        .map_err(|err| format!("failed to prepare file list query: {err}"))?;

    let rows = stmt
        .query_map(params![limit, offset], |row| {
            let id: String = row.get(0)?;
            let node_type: String = row.get(1)?;
            let blob_hash: Option<String> = row.get(2)?;
            let properties_raw: String = row.get(3)?;
            let created_at: Option<i64> = row.get(4)?;
            let updated_at: Option<i64> = row.get(5)?;
            let is_aligned: i64 = row.get(6)?;

            Ok(hydrate_file_node_json(
                id,
                node_type,
                blob_hash,
                properties_raw,
                is_aligned,
                created_at,
                updated_at,
            ))
        })
        .map_err(|err| format!("failed to execute file list query: {err}"))?;

    let files: Result<Vec<_>, _> = rows.collect();
    files.map_err(|err| format!("failed to read file list rows: {err}"))
}

#[tauri::command]
fn get_file_node(db_state: State<'_, DbState>, id: String) -> Result<serde_json::Value, String> {
    let conn = db_state
        .conn
        .lock()
        .map_err(|_| "failed to acquire sqlite connection lock".to_string())?;

    let row = conn
        .query_row(
            "SELECT id, node_type, blob_hash, properties, is_aligned \
             FROM nodes \
             WHERE id = ? \
             LIMIT 1",
            params![id],
            |row| {
                let id: String = row.get(0)?;
                let node_type: String = row.get(1)?;
                let blob_hash: Option<String> = row.get(2)?;
                let properties_raw: String = row.get(3)?;
                let is_aligned: i64 = row.get(4)?;

                Ok(hydrate_file_node_json(
                    id,
                    node_type,
                    blob_hash,
                    properties_raw,
                    is_aligned,
                    None,
                    None,
                ))
            },
        )
        .optional()
        .map_err(|err| format!("failed to query file node: {err}"))?;

    row.ok_or_else(|| "file node not found".to_string())
}

fn main() {
    pyo3::prepare_freethreaded_python();

    tauri::Builder::default()
        .setup(|app| {
            let db_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../.labflow_index.db");
            let conn = core_engine::db::init_db(&db_path)
                .map_err(|err| format!("failed to initialize sqlite index db: {err}"))?;
            core_engine::background_worker::spawn_alignment_daemon(db_path.clone());
            app.manage(DbState {
                conn: Mutex::new(conn),
            });
            Ok(())
        })
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
            run_plugin_sandbox,
            run_analysis_module,
            commit_agent_analysis,
            create_note_node,
            import_raw_file,
            read_blob_bytes,
            update_note_node,
            delete_node,
            link_nodes,
            update_file_metadata,
            list_files,
            get_file_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running LabFlow desktop shell");
}
