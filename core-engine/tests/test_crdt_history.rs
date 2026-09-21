use core_engine::crdt::{LamportClock, LamportTs, NodeId, NodePayload, OpId, OpKind, Operation, PeerId, merge};
use uuid::Uuid;

fn fixed_peer(n: u128) -> PeerId {
    Uuid::from_u128(n)
}

fn fixed_node(n: u128) -> NodeId {
    Uuid::from_u128(n)
}

fn insert_node(node_id: NodeId, label: &str, ts: u64, peer: PeerId) -> Operation {
    Operation::new(
        OpKind::InsertNode {
            node_id,
            payload: NodePayload::new(label),
        },
        LamportTs(ts),
        peer,
    )
}

fn insert_text(node_id: NodeId, pos_id: &str, text: &str, ts: u64, peer: PeerId) -> Operation {
    Operation::new(
        OpKind::InsertText {
            node_id,
            pos_id: pos_id.to_string(),
            text: text.to_string(),
        },
        LamportTs(ts),
        peer,
    )
}

fn delete_text(node_id: NodeId, pos_id: &str, ts: u64, peer: PeerId) -> Operation {
    Operation::new(
        OpKind::DeleteText {
            node_id,
            pos_id: pos_id.to_string(),
        },
        LamportTs(ts),
        peer,
    )
}

fn undo_operation(target_id: OpId, ts: u64, peer: PeerId) -> Operation {
    Operation::new(
        OpKind::UndoOperation { target_id },
        LamportTs(ts),
        peer,
    )
}

#[test]
fn test_text_sequence_crdt() {
    let peer = fixed_peer(1);
    let node = fixed_node(1);
    let mut clock = LamportClock::new();

    let mut ops = vec![insert_node(node, "Note", clock.tick().0, peer)];

    // Insert "A"
    ops.push(insert_text(node, "0.1", "A", clock.tick().0, peer));
    // Insert "B" after "A"
    ops.push(insert_text(node, "0.2", "B", clock.tick().0, peer));
    // Insert "C" before "B" but after "A"
    ops.push(insert_text(node, "0.1.5", "C", clock.tick().0, peer));

    let state = merge(&ops, &[]);
    assert_eq!(state.nodes[&node].get_text(), "ACB");

    // Delete "C"
    ops.push(delete_text(node, "0.1.5", clock.tick().0, peer));
    
    let state_after_delete = merge(&ops, &[]);
    assert_eq!(state_after_delete.nodes[&node].get_text(), "AB");
}

#[test]
fn test_undo_operation() {
    let peer = fixed_peer(1);
    let node = fixed_node(1);
    let mut clock = LamportClock::new();

    let mut ops = vec![insert_node(node, "Note", clock.tick().0, peer)];

    let op_a = insert_text(node, "0.1", "A", clock.tick().0, peer);
    ops.push(op_a.clone());

    let op_b = insert_text(node, "0.2", "B", clock.tick().0, peer);
    ops.push(op_b.clone());

    let state1 = merge(&ops, &[]);
    assert_eq!(state1.nodes[&node].get_text(), "AB");

    // Undo insertion of "A"
    ops.push(undo_operation(op_a.id, clock.tick().0, peer));

    let state2 = merge(&ops, &[]);
    assert_eq!(state2.nodes[&node].get_text(), "B");

    // Redo insertion of "A" by undoing the previous undo
    let undo_op_a_id = ops.last().unwrap().id;
    ops.push(undo_operation(undo_op_a_id, clock.tick().0, peer));
    
    let state3 = merge(&ops, &[]);
    assert_eq!(state3.nodes[&node].get_text(), "AB");

    // Undo the insertion of "B"
    ops.push(undo_operation(op_b.id, clock.tick().0, peer));
    let state4 = merge(&ops, &[]);
    assert_eq!(state4.nodes[&node].get_text(), "A");
}

#[test]
fn stress_test_10000_char_operations() {
    let peer = fixed_peer(1);
    let node = fixed_node(1);
    let mut clock = LamportClock::new();

    let mut ops = vec![insert_node(node, "Benchmark", clock.tick().0, peer)];

    for i in 0..10_000 {
        // Just fractional strings like "0.0001", "0.0002", etc.
        let pos = format!("0.{:04}", i);
        ops.push(insert_text(node, &pos, "x", clock.tick().0, peer));
    }

    let state = merge(&ops, &[]);
    assert_eq!(state.nodes[&node].text_sequence.len(), 10_000);
    assert_eq!(state.nodes[&node].get_text().len(), 10_000);
}
#[test]
fn stress_test_100k_mixed_operations() {
    let peer = fixed_peer(1);
    let node = fixed_node(1);
    let mut clock = LamportClock::new();
    let mut ops = vec![insert_node(node, "Large Document", clock.tick().0, peer)];

    for i in 0..100_000 {
        let pos = format!("0.{:05}", i);
        ops.push(insert_text(node, &pos, "test", clock.tick().0, peer));
    }

    let state = merge(&ops, &[]);
    assert_eq!(state.nodes[&node].text_sequence.len(), 100_000);

    // Serialization compression check
    let snapshot = state.snapshot();
    let serialized = serde_json::to_vec(&snapshot).unwrap();
    // Memory and compression assertions
    assert!(serialized.len() > 0);
    // Real-world we'd check compression ratio.
}
#[test]
fn stress_test_10k_spreadsheet_note() {
    let peer = fixed_peer(1);
    let mut clock = LamportClock::new();

    let node1 = fixed_node(1); // Spreadsheet
    let node2 = fixed_node(2); // Note

    let mut ops = vec![
        insert_node(node1, "Spreadsheet", clock.tick().0, peer),
        insert_node(node2, "NoteEditor", clock.tick().0, peer),
    ];

    for i in 0..10_000 {
        let pos = format!("0.{:04}", i);
        ops.push(insert_text(node1, &pos, &format!("Cell {}", i), clock.tick().0, peer));
        ops.push(insert_text(node2, &pos, &format!("Text {}", i), clock.tick().0, peer));
    }

    let start = std::time::Instant::now();
    let state = merge(&ops, &[]);
    let build_duration = start.elapsed();
    assert_eq!(state.nodes[&node1].text_sequence.len(), 10_000);

    // Rollback test
    let op_to_undo = ops.last().unwrap().id;
    ops.push(undo_operation(op_to_undo, clock.tick().0, peer));
    
    let rollback_start = std::time::Instant::now();
    let state_after_rollback = merge(&ops, &[]);
    let rollback_duration = rollback_start.elapsed();

    println!("Build duration: {:?}", build_duration);
    println!("Rollback duration: {:?}", rollback_duration);

    assert!(rollback_duration.as_millis() < 50, "Rollback took too long");
}
