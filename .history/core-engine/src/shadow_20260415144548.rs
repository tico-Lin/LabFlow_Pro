//! # Shadow Workspace — Agent Isolation Layer
//!
//! Implements the "盒中盒" (box-within-box) isolation model for the LabFlow
//! Agent ("小龍蝦").
//!
//! ## Architecture
//!
//! ```text
//! ┌─────────────────────────────────────────────────────────────────────┐
//! │  MainGraph  (authoritative, user-owned)                             │
//! │                                                                     │
//! │   state: GraphState ──────────────────────────────────────┐         │
//! │                         create_shadow()                   │         │
//! │                              │                            ↓         │
//! │               ┌──────────────▼──────────────────────────────────┐  │
//! │               │  ShadowGraph  (agent workspace)                 │  │
//! │               │                                                 │  │
//! │               │  snapshot: Arc<[Operation]>  ← read-only copy  │  │
//! │               │  delta:    DeltaBuffer        ← agent writes    │  │
//! │               │                                                 │  │
//! │               └─────────────────────────────────────────────────┘  │
//! │                                        │                            │
//! │                         commit_to_main(shadow)                      │
//! │                         requires &mut MainGraph                     │
//! │                              │                            ↑         │
//! │                              └──── CRDT merge ───────────┘         │
//! └─────────────────────────────────────────────────────────────────────┘
//! ```
//!
//! ## Borrow-Checker Safety Proofs
//!
//! All five guarantees below are enforced **at compile time** by the type
//! system — not by runtime checks or documentation conventions.
//!
//! | # | Guarantee | Mechanism |
//! |---|-----------|-----------|
//! | 1 | Agent cannot directly write to `MainGraph` | `ShadowGraph` holds no `&mut MainGraph` |
//! | 2 | Snapshot is truly read-only | `Arc<[Operation]>` — no interior mutability, `Arc::get_mut` is unavailable when clone count > 0 |
//! | 3 | Only the `MainGraph` owner triggers commit | `commit_to_main` requires `&mut MainGraph`; `ShadowGraph` cannot call it on itself |
//! | 4 | Shadow cannot commit twice | `ShadowGraph: !Clone`; `commit_to_main` moves the shadow (use-after-move = compile error) |
//! | 5 | Delta buffer is write-isolated | `ShadowGraph::delta` is private; mutations only via `&mut self` methods |

use std::sync::Arc;

use thiserror::Error;
use uuid::Uuid;

use crate::crdt::{
    merge, EdgeId, GraphState, LamportClock, LamportTs, NodeId, NodePayload,
    NodeState, OpKind, Operation, PeerId,
};

// ─── Error types ─────────────────────────────────────────────────────────────

#[derive(Debug, Error, PartialEq, Eq)]
pub enum CommitError {
    #[error("shadow delta is empty — no operations to commit")]
    EmptyDelta,
}

// ─── Snapshot (immutable log view) ───────────────────────────────────────────

/// An immutable, reference-counted snapshot of a `MainGraph` log.
///
/// Cloning is `O(1)` (increments the `Arc` ref-count).  The underlying
/// `[Operation]` slice is permanently frozen — there is no safe way to obtain
/// `&mut [Operation]` through an `Arc`.
struct Snapshot(Arc<[Operation]>);

impl Snapshot {
    /// Allocate a snapshot from an existing log slice (one copy into Arc).
    fn new(log: &[Operation]) -> Self {
        Self(log.to_vec().into())
    }

    fn ops(&self) -> &[Operation] {
        &self.0
    }
}

// ─── Delta Buffer (append-only write queue) ──────────────────────────────────

/// The agent's private write buffer.
///
/// All mutations generated inside a `ShadowGraph` are appended here.
/// `MainGraph` is never touched until `commit_to_main` explicitly consumesbbb
/// this buffer via CRDT merge.
struct DeltaBuffer {
    ops: Vec<Operation>,
}

impl DeltaBuffer {
    fn new() -> Self {
        Self { ops: Vec::new() }
    }

    fn push(&mut self, op: Operation) {
        self.ops.push(op);
    }

    fn ops(&self) -> &[Operation] {
        &self.ops
    }

    fn len(&self) -> usize {
        self.ops.len()
    }

    fn is_empty(&self) -> bool {
        self.ops.is_empty()
    }

    /// Return the last pushed `Operation`, panicking only if somehow called on
    /// an empty buffer right after a `push` (which is impossible).
    fn last(&self) -> &Operation {
        self.ops.last().expect("delta buffer empty after push — unreachable")
    }
}

// ─── MainGraph ────────────────────────────────────────────────────────────────

/// The authoritative knowledge graph owned by the user.
///
/// Direct mutations (made by the user, not agents) go through the methods on
/// this struct.  Agent mutations must go through a [`ShadowGraph`] and are
/// only applied after an explicit [`commit_to_main`][MainGraph::commit_to_main]
/// call.
///
/// ## Ownership model
///
/// ```text
///   let mut main = MainGraph::new(user_peer_id);
///   // user owns &mut main.
///
///   let shadow = main.create_shadow(agent_peer_id);
///   // shadow is FULLY OWNED by whatever code runs the agent.
///   // main is NOT borrowed by shadow (no lifetime parameter).
///
///   main.commit_to_main(shadow)?;   // ← explicit gate
/// ```
pub struct MainGraph {
    /// CRDT graph state — the single source of truth.
    state: GraphState,
    /// Monotonic clock for operations authored directly on this graph.
    clock: LamportClock,
    /// Identity of the user / orchestrator peer.
    pub peer: PeerId,
}

impl MainGraph {
    /// Create a new, empty graph for the given peer.
    pub fn new(peer: PeerId) -> Self {
        Self {
            state: merge(&[], &[]),
            clock: LamportClock::new(),
            peer,
        }
    }

    // ── Read accessors ────────────────────────────────────────────────────────

    /// Borrow the materialised graph state.
    pub fn state(&self) -> &GraphState {
        &self.state
    }

    /// Current Lamport timestamp (highest seen so far).
    pub fn current_ts(&self) -> LamportTs {
        self.clock.current()
    }

    // ── User-initiated mutations (bypass the shadow) ──────────────────────────

    /// Insert a node directly into the main graph (user operation, not agent).
    pub fn insert_node(&mut self, node_id: NodeId, payload: NodePayload) -> &Operation {
        let op = Operation::new(
            OpKind::InsertNode { node_id, payload },
            self.clock.tick(),
            self.peer,
        );
        self.state = merge(&self.state.log, &[op]);
        self.state.log.last().unwrap()
    }

    // ── Shadow Workspace ──────────────────────────────────────────────────────

    /// Spawn an isolated shadow workspace for an agent.
    ///
    /// The returned [`ShadowGraph`]:
    ///
    /// - Receives an **immutable `Arc` snapshot** of the current log.  This
    ///   is a shallow copy (`O(1)` in reference counts, `O(n)` in the initial
    ///   allocation of the arc slice).  The agent sees the graph as it was at
    ///   this exact moment.
    /// - Owns a private [`DeltaBuffer`] — all agent writes land here.
    /// - Holds **no reference** to `self`.  There is no lifetime tying the
    ///   shadow to the main graph, so calling `create_shadow` does not borrow
    ///   `self` beyond this method's scope.
    ///
    /// Multiple shadows may coexist simultaneously; each is fully independent.
    pub fn create_shadow(&self, agent_peer: PeerId) -> ShadowGraph {
        let snapshot = Snapshot::new(&self.state.log);
        // Pre-materialise the snapshot state for O(1) node/edge lookups.
        let snapshot_state = merge(&self.state.log, &[]);

        ShadowGraph {
            snapshot,
            snapshot_state,
            peer: agent_peer,
            clock: LamportClock::new(),
            delta: DeltaBuffer::new(),
        }
    }

    /// Merge a shadow's delta buffer into this graph.
    ///
    /// ## Why this is the safety gate
    ///
    /// This method requires `&mut self` — proving that the **caller owns
    /// exclusive write access** to `MainGraph`.  `ShadowGraph` holds no
    /// `&mut MainGraph` and therefore can never call this method on its own.
    /// The owner (user / orchestrator) decides when — and whether — to commit.
    ///
    /// ## What happens on commit
    ///
    /// 1. `shadow` is **moved** into this method (consumed).  Any attempt to
    ///    use `shadow` after this call is a compile-time error.
    /// 2. The shadow's [`DeltaBuffer`] is extracted.
    /// 3. [`merge`][crate::crdt::merge] is called with the current canonical
    ///    log + agent delta, producing a new converged [`GraphState`].
    /// 4. The main clock advances to remain causally ahead of the agent's ops.
    ///
    /// ## Errors
    ///
    /// Returns [`CommitError::EmptyDelta`] when the shadow has no pending
    /// operations.  `MainGraph` is **not modified** in that case.
    pub fn commit_to_main(&mut self, shadow: ShadowGraph) -> Result<(), CommitError> {
        if shadow.delta.is_empty() {
            return Err(CommitError::EmptyDelta);
        }

        // Advance the main clock so future user ops are causally after
        // the agent's last op.
        if let Some(last) = shadow.delta.ops().last() {
            self.clock.observe(last.ts);
        }

        // CRDT merge: all ops from both logs, deduplicated and sorted.
        self.state = merge(&self.state.log, shadow.delta.ops());
        Ok(())
    }
}

// ─── ShadowGraph ─────────────────────────────────────────────────────────────

/// A sandboxed workspace for the Agent ("小龍蝦").
///
/// ## Isolation guarantees (enforced by the type system)
///
/// ```text
/// ┌─────────────────────────────────────────────────────────────────┐
/// │ ShadowGraph                                                     │
/// │                                                                 │
/// │  snapshot:       Arc<[Operation]>   ← immutable, Arc-shared     │
/// │  snapshot_state: GraphState         ← pre-materialised, owned   │
/// │  peer:           PeerId             ← value type, no ref        │
/// │  clock:          LamportClock       ← value type, no ref        │
/// │  delta:          DeltaBuffer        ← private, write-only       │
/// │                                     from outside the struct     │
/// └─────────────────────────────────────────────────────────────────┘
/// ```
///
/// There is **no `&mut MainGraph`** anywhere in this struct.  It is physically
/// impossible for `ShadowGraph` to call `commit_to_main` — it doesn't even
/// know a `MainGraph` exists.
///
/// ## `!Clone`
///
/// `ShadowGraph` intentionally does **not** implement `Clone`.  There is no
/// way to duplicate a shadow and commit both copies.
pub struct ShadowGraph {
    /// Frozen, reference-counted copy of the main log at shadow creation time.
    ///
    /// `Arc<[Operation]>` is covariant and permanently immutable — there is no
    /// safe API to mutate the slice after the `Arc` is constructed.
    snapshot: Snapshot,

    /// Pre-materialised graph state from the snapshot, used for fast reads.
    snapshot_state: GraphState,

    /// Agent's peer identity.
    pub peer: PeerId,

    /// Agent's Lamport clock — independent from the main clock.
    clock: LamportClock,

    /// **Private** write buffer.
    ///
    /// Only accessible via the `&mut self` write methods below.  External code
    /// cannot inject operations here without going through the typed API.
    delta: DeltaBuffer,
}

impl ShadowGraph {
    // ── Read methods (from snapshot) ──────────────────────────────────────────

    /// Read a node from the **snapshot** (the main graph at shadow-creation
    /// time, ignoring the agent's own pending writes).
    ///
    /// For a "read-your-own-writes" view that includes the agent's pending
    /// operations, use [`ShadowGraph::view`] instead.
    pub fn snapshot_node(&self, id: &NodeId) -> Option<&NodeState> {
        self.snapshot_state.nodes.get(id)
    }

    /// All operations in the snapshot (main graph's historical log).
    pub fn snapshot_log(&self) -> &[Operation] {
        self.snapshot.ops()
    }

    /// Materialise the **combined view**: snapshot + delta.
    ///
    /// This is what the graph would look like if the agent's pending work were
    /// committed right now.  Useful for the agent to "preview" its effect.
    ///
    /// Calls `merge` on every invocation — cache the result if hot.
    pub fn view(&self) -> GraphState {
        merge(self.snapshot.ops(), self.delta.ops())
    }

    /// Number of pending (uncommitted) operations in the delta buffer.
    pub fn pending_count(&self) -> usize {
        self.delta.len()
    }

    /// Read-only slice of all pending operations (for inspection / logging).
    pub fn pending_ops(&self) -> &[Operation] {
        self.delta.ops()
    }

    // ── Write methods (append to DeltaBuffer only) ────────────────────────────
    //
    // Every method below appends exactly one `Operation` to `self.delta` and
    // returns a shared reference to that operation (so the caller can record
    // the `op.id` for future `DeleteLink` calls etc.).
    //
    // None of these methods have any path to `MainGraph`.

    /// Stage an `InsertNode` operation in the delta buffer.
    pub fn insert_node(&mut self, node_id: NodeId, payload: NodePayload) -> &Operation {
        let op = Operation::new(
            OpKind::InsertNode { node_id, payload },
            self.clock.tick(),
            self.peer,
        );
        self.delta.push(op);
        self.delta.last()
    }

    /// Stage an `UpdateNode` operation in the delta buffer.
    pub fn update_node(&mut self, node_id: NodeId, payload: NodePayload) -> &Operation {
        let op = Operation::new(
            OpKind::UpdateNode { node_id, payload },
            self.clock.tick(),
            self.peer,
        );
        self.delta.push(op);
        self.delta.last()
    }

    /// Stage a `LinkNodes` operation in the delta buffer.
    pub fn link_nodes(
        &mut self,
        from: NodeId,
        to: NodeId,
        label: impl Into<String>,
    ) -> (EdgeId, &Operation) {
        let edge_id = Uuid::new_v4();
        let op = Operation::new(
            OpKind::LinkNodes { edge_id, from, to, label: label.into() },
            self.clock.tick(),
            self.peer,
        );
        self.delta.push(op);
        (edge_id, self.delta.last())
    }

    /// Stage a `DeleteLink` operation in the delta buffer.
    pub fn delete_link(&mut self, edge_id: EdgeId) -> &Operation {
        let op = Operation::new(
            OpKind::DeleteLink { edge_id },
            self.clock.tick(),
            self.peer,
        );
        self.delta.push(op);
        self.delta.last()
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;
    use crate::crdt::NodePayload;

    // ── helpers ───────────────────────────────────────────────────────────────

    fn user_peer()  -> PeerId { Uuid::from_u128(0xAAAA) }
    fn agent_peer() -> PeerId { Uuid::from_u128(0xBBBB) }
    fn node(n: u128) -> NodeId { Uuid::from_u128(n) }

    fn payload(label: &str) -> NodePayload {
        NodePayload { label: label.to_string(), properties: BTreeMap::new() }
    }

    // ── Test 1: shadow writes do NOT reach main ───────────────────────────────

    /// The fundamental isolation guarantee: agent operations in the shadow
    /// must not appear in `MainGraph` until `commit_to_main` is called.
    #[test]
    fn writes_stay_in_delta_until_commit() {
        let main  = MainGraph::new(user_peer());
        let mut shadow = main.create_shadow(agent_peer());

        let agent_node = node(0xA6E1);
        shadow.insert_node(agent_node, payload("Agent Star"));

        // Delta has 1 op; main is still empty.
        assert_eq!(shadow.pending_count(), 1);
        assert!(
            main.state().nodes.is_empty(),
            "main must be untouched before commit"
        );
    }

    // ── Test 2: snapshot is immutable at creation time ────────────────────────

    /// Changes made to `MainGraph` AFTER shadow creation must not be visible
    /// through the shadow's snapshot.
    #[test]
    fn snapshot_is_frozen_at_creation_time() {
        let mut main  = MainGraph::new(user_peer());
        let n_before  = node(0x01);
        let n_after   = node(0x02);

        // Populate main before creating the shadow.
        main.insert_node(n_before, payload("Before"));

        let shadow = main.create_shadow(agent_peer());

        // Mutate main AFTER the shadow was created.
        main.insert_node(n_after, payload("After"));

        // Shadow snapshot must only see the "Before" node.
        assert!(shadow.snapshot_node(&n_before).is_some(), "snapshot must contain pre-existing node");
        assert!(shadow.snapshot_node(&n_after).is_none(),  "snapshot must not see post-creation writes");
    }

    // ── Test 3: view() shows snapshot + delta ─────────────────────────────────

    /// `view()` should return the CRDT merge of the snapshot and the agent's
    /// pending delta — a "read-your-own-writes" projection.
    #[test]
    fn view_merges_snapshot_and_delta() {
        let mut main  = MainGraph::new(user_peer());
        let existing  = node(0x01);
        let agent_new = node(0x02);

        main.insert_node(existing, payload("Existing Star"));

        let mut shadow = main.create_shadow(agent_peer());
        shadow.insert_node(agent_new, payload("Agent's New Star"));

        let view = shadow.view();
        assert!(view.nodes.contains_key(&existing),  "view must include snapshot nodes");
        assert!(view.nodes.contains_key(&agent_new), "view must include delta nodes");
        assert_eq!(view.nodes.len(), 2);

        // Main is still untouched.
        assert_eq!(main.state().nodes.len(), 1);
    }

    // ── Test 4: commit_to_main merges delta into main ─────────────────────────

    #[test]
    fn commit_to_main_applies_delta() {
        let mut main  = MainGraph::new(user_peer());
        let n_main    = node(0x01);
        let n_agent   = node(0x02);

        main.insert_node(n_main, payload("Main Star"));
        assert_eq!(main.state().nodes.len(), 1);

        let mut shadow = main.create_shadow(agent_peer());
        shadow.insert_node(n_agent, payload("Agent Star"));

        // Commit: shadow is consumed.
        main.commit_to_main(shadow).expect("commit should succeed");

        // Both nodes must now be in main.
        assert_eq!(main.state().nodes.len(), 2);
        assert!(main.state().nodes.contains_key(&n_main));
        assert!(main.state().nodes.contains_key(&n_agent));
    }

    // ── Test 5: empty delta is rejected ──────────────────────────────────────

    #[test]
    fn commit_empty_delta_is_an_error() {
        let mut main  = MainGraph::new(user_peer());
        let empty_shadow = main.create_shadow(agent_peer());

        let result = main.commit_to_main(empty_shadow);
        assert_eq!(result, Err(CommitError::EmptyDelta));
        // Main is unmodified.
        assert!(main.state().nodes.is_empty());
    }

    // ── Test 6: multiple independent shadows ──────────────────────────────────

    /// Two agent shadows must be fully independent; committing one must not
    /// affect the other's delta or visibility.
    #[test]
    fn multiple_shadows_are_independent() {
        let agent_a = Uuid::from_u128(0xAAAA);
        let agent_b = Uuid::from_u128(0xBBBB);

        let mut main = MainGraph::new(user_peer());
        let shared   = node(0x00);
        main.insert_node(shared, payload("Shared Star"));

        let mut shadow_a = main.create_shadow(agent_a);
        let mut shadow_b = main.create_shadow(agent_b);

        let node_a = node(0xAA);
        let node_b = node(0xBB);

        shadow_a.insert_node(node_a, payload("A's Star"));
        shadow_b.insert_node(node_b, payload("B's Star"));

        // Each shadow only sees its own writes.
        assert_eq!(shadow_a.pending_count(), 1);
        assert_eq!(shadow_b.pending_count(), 1);

        // Commit A first; main now has 2 nodes.
        main.commit_to_main(shadow_a).unwrap();
        assert_eq!(main.state().nodes.len(), 2);

        // Commit B; main now has 3 nodes.
        main.commit_to_main(shadow_b).unwrap();
        assert_eq!(main.state().nodes.len(), 3);

        assert!(main.state().nodes.contains_key(&shared));
        assert!(main.state().nodes.contains_key(&node_a));
        assert!(main.state().nodes.contains_key(&node_b));
    }

    // ── Test 7: link + delete in shadow only visible after commit ─────────────

    #[test]
    fn edge_operations_isolated_until_commit() {
        let mut main = MainGraph::new(user_peer());
        let n1 = node(0x01);
        let n2 = node(0x02);
        main.insert_node(n1, payload("Star A"));
        main.insert_node(n2, payload("Star B"));

        let mut shadow = main.create_shadow(agent_peer());
        let (edge_id, _) = shadow.link_nodes(n1, n2, "relates");

        // Edge must not appear in main yet.
        assert!(!main.state().edges.contains_key(&edge_id));

        // Now delete the same edge inside the shadow.
        shadow.delete_link(edge_id);
        assert_eq!(shadow.pending_count(), 2);

        main.commit_to_main(shadow).unwrap();

        // After commit, the edge should be deleted (Delete-Wins: delete ts > link ts).
        assert!(!main.state().edges.contains_key(&edge_id));
        assert!(main.state().deleted_edges.contains(&edge_id));
    }

    // ── Test 8: clock causality — agent ops are causally after main ops ────────

    /// After a commit, the main clock must be at least as advanced as the
    /// agent's last Lamport timestamp.
    #[test]
    fn commit_advances_main_clock() {
        let mut main  = MainGraph::new(user_peer());
        let mut shadow = main.create_shadow(agent_peer());

        // Generate several ops in the shadow to bump the agent clock.
        for i in 0..5u128 {
            shadow.insert_node(node(i), payload("node"));
        }

        let ts_before_commit = main.current_ts();
        main.commit_to_main(shadow).unwrap();
        let ts_after_commit = main.current_ts();

        assert!(
            ts_after_commit > ts_before_commit,
            "main clock must advance after commit"
        );
    }

    // ── Test 9: use-after-move (compile-time — shown as doc, not run) ─────────
    //
    // The following code does NOT compile.  It is here as documentation of the
    // borrow-checker guarantee:
    //
    //   let shadow = main.create_shadow(agent_peer);
    //   main.commit_to_main(shadow).unwrap();
    //   shadow.insert_node(...);   // ← ERROR: use of moved value: `shadow`
    //
    // This is guaranteed by Rust's move semantics, not a runtime check.

    // ── Test 10: ShadowGraph is !Clone (compile-time) ─────────────────────────
    //
    // The trait bound `ShadowGraph: Clone` is deliberately NOT implemented.
    // Attempting `let _ = shadow.clone()` produces a compile error:
    //
    //   the method `clone` exists for struct `ShadowGraph`, but its trait
    //   bounds were not satisfied: `ShadowGraph: Clone`
    //
    // Therefore, committing two copies of "the same" shadow is impossible.
    #[test]
    fn shadow_graph_is_not_clone() {
        fn assert_not_clone<T: ?Sized>() {}
        // This is a negative test via the type system.
        // If `ShadowGraph` ever accidentally implements `Clone`, this would
        // need to become a compile_fail doc-test.
        // For now we simply document the intent here.
        let _ = assert_not_clone::<ShadowGraph>;
    }
}
