use std::collections::HashSet;
use uuid::Uuid;

use core_engine::crdt::{LamportClock, NodePayload, OpKind, Operation, GraphState, merge};
use core_engine::shadow::MainGraph;

#[test]
fn test_extreme_high_frequency_concurrent_writes() {
    let mut ops_a = Vec::new();
    let mut ops_b = Vec::new();
    let mut ops_c = Vec::new();
    let node_id = Uuid::new_v4();

    let peer_a = Uuid::new_v4();
    let peer_b = Uuid::new_v4();
    let peer_c = Uuid::new_v4();

    let mut clk_a = LamportClock::new();
    let mut clk_b = LamportClock::new();
    let mut clk_c = LamportClock::new();

    let insert_op = Operation::new(
        OpKind::InsertNode {
            node_id,
            payload: NodePayload::new("Root"),
        },
        clk_a.tick(),
        peer_a,
    );
    ops_a.push(insert_op.clone());
    clk_b.observe(insert_op.ts);
    clk_c.observe(insert_op.ts);

    let iterations = 5000;
    
    for i in 0..iterations {
        ops_a.push(Operation::new(
            OpKind::UpdateNode {
                node_id,
                payload: NodePayload::new(format!("A {}", i)),
            },
            clk_a.tick(),
            peer_a,
        ));
        
        ops_b.push(Operation::new(
            OpKind::UpdateNode {
                node_id,
                payload: NodePayload::new(format!("B {}", i)),
            },
            clk_b.tick(),
            peer_b,
        ));
        
        ops_c.push(Operation::new(
            OpKind::UpdateNode {
                node_id,
                payload: NodePayload::new(format!("C {}", i)),
            },
            clk_c.tick(),
            peer_c,
        ));
    }

    let mut all_ops = ops_a;
    all_ops.extend(ops_b);
    all_ops.extend(ops_c);

    let state = merge(&all_ops, &[]);
    
    assert_eq!(state.nodes.len(), 1);
    let winning_node = state.nodes.get(&node_id).unwrap();
    
    assert!(winning_node.payload.label.starts_with("A ") || winning_node.payload.label.starts_with("B ") || winning_node.payload.label.starts_with("C "));
}

#[test]
fn test_extreme_huge_string_and_matrix_inserts_with_rollback() {
    let mut ops = Vec::new();
    let node_id = Uuid::new_v4();
    let peer = Uuid::new_v4();
    let mut clk = LamportClock::new();

    ops.push(Operation::new(
        OpKind::InsertNode { node_id, payload: NodePayload::new("Scientific Node") },
        clk.tick(),
        peer,
    ));

    let huge_matrix_data: Vec<u8> = vec![0x42; 5 * 1024 * 1024]; // 5MB matrix
    
    let matrix_op = Operation::new(
        OpKind::DeltaMutation { node_id, delta_data: huge_matrix_data },
        clk.tick(),
        peer,
    );
    
    let rollback_target = matrix_op.ts;
    ops.push(matrix_op);
    
    let huge_string_data = "A".repeat(5 * 1024 * 1024); // 5MB string
    ops.push(Operation::new(
        OpKind::InsertText { node_id, pos_id: "0.5".to_string(), text: huge_string_data },
        clk.tick(),
        peer,
    ));
    
    // We expect the state to handle this size without overflow
    let state = merge(&ops, &[]);
    
    assert_eq!(state.nodes.get(&node_id).unwrap().text_sequence.len(), 1);
    
    // Rollback by manually filtering ops
    let rollback_ops: Vec<Operation> = ops.into_iter().filter(|op| op.ts <= rollback_target).collect();
    let state_after_rollback = merge(&rollback_ops, &[]);
    
    // Text should be removed from materialized state
    assert!(state_after_rollback.nodes.get(&node_id).unwrap().text_sequence.is_empty());
}

#[test]
fn test_extreme_deep_node_deletion_cascade() {
    let mut ops = Vec::new();
    let peer = Uuid::new_v4();
    let mut clk = LamportClock::new();

    let depth = 5000;
    let mut nodes = Vec::new();
    
    // Create chain of nodes
    for i in 0..depth {
        let n_id = Uuid::new_v4();
        nodes.push(n_id);
        ops.push(Operation::new(
            OpKind::InsertNode { node_id: n_id, payload: NodePayload::new(format!("Node {}", i)) },
            clk.tick(),
            peer,
        ));
        
        if i > 0 {
            ops.push(Operation::new(
                OpKind::LinkNodes { edge_id: Uuid::new_v4(), from: nodes[i - 1], to: n_id, label: "child".to_string() },
                clk.tick(),
                peer,
            ));
        }
    }

    let state = merge(&ops, &[]);
    assert_eq!(state.nodes.len(), depth);
    assert_eq!(state.edges.len(), depth - 1);
    
    // Delete root node
    let del_op = Operation::new(
        OpKind::DeleteNode { node_id: nodes[0] },
        clk.tick(),
        peer,
    );
    
    let state_after_del = merge(&ops, &[del_op]);
    assert_eq!(state_after_del.nodes.len(), depth - 1); // Only root deleted from node map
    assert!(state_after_del.deleted_nodes.contains(&nodes[0]));
    
    // Incident edge from root should be effectively deleted. The child edge from node[0] to node[1]
    let remaining_edges_count = state_after_del.edges.len();
    assert_eq!(remaining_edges_count, depth - 2); 
    // Wait, materialised_edges will drop edges where `from` or `to` is in deleted_nodes.
}
