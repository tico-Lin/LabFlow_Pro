#[tauri::command]
fn commit_agent_analysis(
    window: Window,
    state: State<'_, EngineBridgeState>,
    peak_index: usize,
    voltage: f64,
    current: f64,
) -> Result<(), String> {
    use core_engine::crdt::{LamportClock, NodePayload, OpKind, Operation};
    use std::collections::BTreeMap;
    let peer_id = Uuid::new_v4();
    let mut clock = LamportClock::new();

    // 1. 產生分析結果節點
    let mut properties = BTreeMap::new();
    properties.insert("type".to_string(), "agent_analysis".to_string());
    properties.insert("method".to_string(), "find_max_peak".to_string());
    let result_json = json!({ "index": peak_index, "v": voltage, "c": current }).to_string();
    properties.insert("result".to_string(), result_json);
    let payload = NodePayload {
        label: "AgentAnalysisResult".to_string(),
        properties,
    };
    let node_id = Uuid::new_v4();
    let op_analysis = Operation::new(
        OpKind::InsertNode {
            node_id,
            payload,
        },
        clock.tick(),
        peer_id,
    );

    // 2. 嘗試找出上一個資料節點 (若有)
    let prev_node_id = {
        let ops_guard = state.ops_log.lock().map_err(|_| "failed to acquire graph operation log lock".to_string())?;
        ops_guard.iter().rev().find_map(|op| match &op.kind {
            OpKind::InsertNode { node_id, .. } => Some(*node_id),
            _ => None,
        })
    };

    // 3. 建立 derived_from 邊
    let op_link = if let Some(prev_id) = prev_node_id {
        Some(Operation::new(
            OpKind::LinkNodes {
                edge_id: Uuid::new_v4(),
                from: node_id,
                to: prev_id,
                label: "derived_from".to_string(),
            },
            clock.tick(),
            peer_id,
        ))
    } else {
        None
    };

    // 4. append 進 ops_log
    {
        let mut ops_guard = state.ops_log.lock().map_err(|_| "failed to acquire graph operation log lock".to_string())?;
        ops_guard.push(op_analysis.clone());
        if let Some(op_link) = &op_link {
            ops_guard.push(op_link.clone());
        }
    }

    // 5. 通知前端
    let mut op_ids = vec![op_analysis.id.to_string()];
    if let Some(op_link) = &op_link {
        op_ids.push(op_link.id.to_string());
    }
    let payload = json!({ "op_ids": op_ids });
    window.emit("graph-updated", payload).map_err(|err| format!("failed to emit graph-updated: {err}"))?;
    Ok(())
}
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use core_engine::crdt::{self, Operation};
use serde_json::json;
use tauri::{Manager, State, Window};
use tauri::Emitter;
use uuid::Uuid;

struct EngineBridgeState {
    // Keep only replicated operations in this app shell; CRDT logic stays in core-engine.
    ops_log: Mutex<Vec<Operation>>,
}

#[tauri::command]
fn fetch_graph_state(state: State<'_, EngineBridgeState>) -> Result<crdt::GraphSnapshot, String> {
    let ops_guard = state
        .ops_log
        .lock()
        .map_err(|_| "failed to acquire graph operation log lock".to_string())?;

    Ok(crdt::merge(&ops_guard, &[]).snapshot())
}

#[tauri::command]
fn simulate_data_ingestion(window: Window, state: State<'_, EngineBridgeState>) -> Result<(), String> {
    let peer_id = Uuid::new_v4();
    let mock_ascii = "Voltage,Current\n0.1,0.05\n0.2,0.08\n";

    let ops = core_engine::data_ingestion::ingest_ascii_data(mock_ascii, peer_id);
    let op_ids: Vec<String> = ops.iter().map(|op| op.id.to_string()).collect();

    {
        let mut ops_guard = state
            .ops_log
            .lock()
            .map_err(|_| "failed to acquire graph operation log lock".to_string())?;
        ops_guard.extend(ops);
    }

    let payload = json!({ "op_ids": op_ids });
    window
        .emit("graph-updated", payload)
        .map_err(|err| format!("failed to emit graph-updated: {err}"))?;

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

fn main() {
    tauri::Builder::default()
        .manage(EngineBridgeState {
            ops_log: Mutex::new(Vec::new()),
        })
        .invoke_handler(tauri::generate_handler![fetch_graph_state, simulate_data_ingestion, analyze_cv_data, commit_agent_analysis])
        .run(tauri::generate_context!())
        .expect("error while running LabFlow desktop shell");
}
