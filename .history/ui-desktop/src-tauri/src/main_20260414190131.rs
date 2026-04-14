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
        .invoke_handler(tauri::generate_handler![fetch_graph_state, simulate_data_ingestion, analyze_cv_data])
        .run(tauri::generate_context!())
        .expect("error while running LabFlow desktop shell");
}
