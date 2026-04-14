#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

use core_engine::crdt::{self, Operation};
use tauri::State;

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

fn main() {
    tauri::Builder::default()
        .manage(EngineBridgeState {
            ops_log: Mutex::new(Vec::new()),
        })
        .invoke_handler(tauri::generate_handler![fetch_graph_state])
        .run(tauri::generate_context!())
        .expect("error while running LabFlow desktop shell");
}
