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

    // Undo the undo
    // Wait, can we undo an UndoOperation?
    // Let's test undoing the insertion of "B" as well
    ops.push(undo_operation(op_b.id, clock.tick().0, peer));
    let state3 = merge(&ops, &[]);
    assert_eq!(state3.nodes[&node].get_text(), "");
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
