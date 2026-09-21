use tauri::State;
use crate::document_controller::DocumentController;

#[tauri::command]
pub fn init_document_stream(state: State<'_, DocumentController>, doc_id: String) -> Result<(), String> {
    state.init_document_stream(doc_id);
    Ok(())
}

#[tauri::command]
pub fn apply_crdt_delta(state: State<'_, DocumentController>, doc_id: String, encoded_chunk: Vec<u8>) -> Result<(), String> {
    state.apply_crdt_delta(&doc_id, &encoded_chunk)
}

#[tauri::command]
pub fn close_document(state: State<'_, DocumentController>, doc_id: String) -> Result<(), String> {
    state.close_document(&doc_id);
    Ok(())
}

#[tauri::command]
pub fn get_document_snapshot(state: State<'_, DocumentController>, doc_id: String) -> Result<Vec<u8>, String> {
    state.get_document_snapshot(&doc_id)
}

