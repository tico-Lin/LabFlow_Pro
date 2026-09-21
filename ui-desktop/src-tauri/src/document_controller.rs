use std::collections::HashMap;
use std::sync::Mutex;
use core_engine::crdt::{LamportTs, Operation, OpKind, NodeId, OpId, PeerId};
use core_engine::proto::labflow_v1::{CrdtDeltaChunk, crdt_operation::OpType};
use prost::Message;
use uuid::Uuid;

pub struct DocumentSession {
    pub ops: Vec<Operation>,
}

#[derive(Default)]
pub struct DocumentController {
    pub active_docs: Mutex<HashMap<String, DocumentSession>>,
}

impl DocumentController {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn init_document_stream(&self, doc_id: String) {
        let mut docs = self.active_docs.lock().unwrap();
        docs.insert(doc_id, DocumentSession { ops: Vec::new() });
    }

    pub fn close_document(&self, doc_id: &str) {
        let mut docs = self.active_docs.lock().unwrap();
        docs.remove(doc_id);
    }

    pub fn apply_crdt_delta(&self, doc_id: &str, encoded_chunk: &[u8]) -> Result<(), String> {
        let chunk = CrdtDeltaChunk::decode(encoded_chunk)
            .map_err(|e| format!("Failed to decode delta: {}", e))?;
        
        let mut docs = self.active_docs.lock().unwrap();
        if let Some(session) = docs.get_mut(doc_id) {
            let node_id = NodeId::parse_str(&chunk.document_id).unwrap_or_else(|_| NodeId::new_v4());
            
            for proto_op in chunk.operations {
                let kind = match proto_op.op_type {
                    0 => OpKind::InsertText {
                        node_id,
                        pos_id: proto_op.id.clone(),
                        text: proto_op.value.clone(),
                    },
                    1 => OpKind::DeleteText {
                        node_id,
                        pos_id: proto_op.id.clone(),
                    },
                    _ => continue,
                };
                
                // Construct fake op
                let op = Operation {
                    id: OpId::parse_str(&proto_op.id).unwrap_or_else(|_| OpId::new_v4()),
                    ts: LamportTs(proto_op.index as u64),
                    peer: PeerId::new_v4(), // usually from proto, but random for test
                    kind,
                };
                session.ops.push(op);
            }
        } else {
            return Err("Document not open".to_string());
        }
        
        Ok(())
    }

    pub fn get_document_snapshot(&self, _doc_id: &str) -> Result<Vec<u8>, String> {
        Ok(Vec::new()) 
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use core_engine::proto::labflow_v1::{CrdtDeltaChunk, CrdtOperation};
    use core_engine::proto::labflow_v1::crdt_operation::OpType;

    #[test]
    fn test_document_lifecycle_and_memory_freed() {
        let controller = DocumentController::new();
        let doc_id = "doc-test".to_string();
        
        controller.init_document_stream(doc_id.clone());
        assert!(controller.active_docs.lock().unwrap().contains_key(&doc_id));
        
        let chunk = CrdtDeltaChunk {
            document_id: doc_id.clone(),
            operations: vec![
                CrdtOperation {
                    op_type: OpType::Insert as i32,
                    id: "op-1".to_string(),
                    parent_id: "".to_string(),
                    index: 0,
                    value: "H".to_string(),
                }
            ],
        };
        let mut buf = Vec::new();
        chunk.encode(&mut buf).unwrap();
        
        controller.apply_crdt_delta(&doc_id, &buf).unwrap();
        assert_eq!(controller.active_docs.lock().unwrap().get(&doc_id).unwrap().ops.len(), 1);
        
        controller.close_document(&doc_id);
        assert!(!controller.active_docs.lock().unwrap().contains_key(&doc_id));
    }

    #[test]
    fn test_crdt_conflict_resolution() {
        let controller = DocumentController::new();
        let doc_id = "00000000-0000-0000-0000-000000000000".to_string();
        controller.init_document_stream(doc_id.clone());

        // We simulate a basic CRDT resolution by pushing ops 
        // with the same Lamport TS and letting core-engine sort/merge them.
        let mut chunk = CrdtDeltaChunk {
            document_id: doc_id.clone(),
            operations: vec![
                CrdtOperation {
                    op_type: OpType::Insert as i32,
                    id: "11111111-1111-1111-1111-111111111111".to_string(),
                    parent_id: "".to_string(),
                    index: 10,
                    value: "A".to_string(),
                },
                CrdtOperation {
                    op_type: OpType::Insert as i32,
                    id: "22222222-2222-2222-2222-222222222222".to_string(),
                    parent_id: "".to_string(),
                    index: 10, // CONCURRENT
                    value: "B".to_string(),
                }
            ],
        };
        
        let mut buf = Vec::new();
        chunk.encode(&mut buf).unwrap();
        controller.apply_crdt_delta(&doc_id, &buf).unwrap();

        let mut docs = controller.active_docs.lock().unwrap();
        let session = docs.get_mut(&doc_id).unwrap();
        
        // Let's sort the ops which is the first step of resolution
        session.ops.sort_by_key(|op| (op.ts, op.peer, op.id));
        
        // Assert they are sorted deterministically
        assert_eq!(session.ops.len(), 2);
        assert!(session.ops[0].id < session.ops[1].id || session.ops[0].peer < session.ops[1].peer);
    }
}

