use prost::Message;
use core_engine::proto::labflow_v1::{CrdtDeltaChunk, CrdtOperation};
use core_engine::proto::labflow_v1::crdt_operation::OpType;

#[test]
fn bench_crdt_proto_serialization() {
    let mut operations = Vec::with_capacity(10000);
    for i in 0..10000 {
        operations.push(CrdtOperation {
            op_type: OpType::Insert as i32,
            id: format!("op-{}", i),
            parent_id: format!("op-{}", i - 1),
            index: i as u32,
            value: "a".to_string(),
        });
    }

    let chunk = CrdtDeltaChunk {
        document_id: "doc-1".to_string(),
        operations,
    };

    let start_enc = std::time::Instant::now();
    let mut buf = Vec::new();
    chunk.encode(&mut buf).unwrap();
    let enc_duration = start_enc.elapsed();

    let start_dec = std::time::Instant::now();
    let decoded = CrdtDeltaChunk::decode(&buf[..]).unwrap();
    let dec_duration = start_dec.elapsed();

    println!("[Rust] 10,000 ops - Encode: {:?}, Decode: {:?}", enc_duration, dec_duration);

    assert_eq!(decoded.document_id, "doc-1");
    assert_eq!(decoded.operations.len(), 10000);
    assert_eq!(decoded.operations[9999].value, "a");
    
    // Ensure it executes flawlessly in under ~50ms
    assert!(enc_duration.as_millis() < 50, "Encoding took too long");
    assert!(dec_duration.as_millis() < 50, "Decoding took too long");
}

