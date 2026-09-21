use core_engine::data_ingestion::{parse_hdf5_mock, ingest_large_file};
use core_engine::crdt::OpKind;
use uuid::Uuid;
use std::io::Write;
use tempfile::NamedTempFile;

#[test]
fn test_parse_hdf5_mock() {
    let mut temp_file = NamedTempFile::new().expect("failed to create temp file");
    temp_file.write_all(&[0x89, b'H', b'D', b'F', b'\r', b'\n', 0x1a, b'\n']).unwrap();
    temp_file.flush().unwrap();
    
    let peer_id = Uuid::new_v4();
    let ops = ingest_large_file(temp_file.path(), peer_id).expect("ingest_large_file failed");
    
    assert_eq!(ops.len(), 1);
    match &ops[0].kind {
        OpKind::InsertNode { payload, .. } => {
            let json = payload.content.clone().expect("content missing");
            assert_eq!(json["instrument_format"], "hdf5");
            assert!(json["metadata"]["hdf5_structure"].is_object());
        }
        _ => panic!("Expected InsertNode"),
    }
}

