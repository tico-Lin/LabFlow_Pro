//! # Graph-CRDT
//!
//! Conflict-free Replicated Data Type (CRDT) for the LabFlow Knowledge Graph.
//!
//! ## Data model
//!
//! The graph is a set of **Nodes** connected by **directed Edges**.
//! Every mutation is recorded as an immutable [`Operation`] stamped with a
//! [`LamportTs`] and the issuing [`PeerId`].  The operations are the single
//! source of truth; the [`GraphState`] is a pure materialized view.
//!
//! ## Conflict-resolution rules
//!
//! | Scenario                                          | Resolution            |
//! |---------------------------------------------------|-----------------------|
//! | Concurrent `InsertNode`/`UpdateNode`, same node   | LWW – higher `(ts, peer)` |
//! | Concurrent `LinkNodes` + `DeleteLink`, same edge  | **Delete-Wins**       |
//! | Non-concurrent: any op vs any op, same target     | Higher `(ts, peer, id)` |
//!
//! ## CRDT properties
//!
//! `merge(A, B)` is **commutative**, **associative**, and **idempotent**:
//!
//! ```text
//! merge(A, B)           == merge(B, A)           // commutativity
//! merge(merge(A,B), C)  == merge(A, merge(B,C))  // associativity
//! merge(A, A)           == merge(A, [])           // idempotency
//! ```
//!
//! ## Append-only log
//!
//! [`GraphState::log`] is the canonical, sorted, deduplicated operation
//! sequence.  The [`log_codec`] submodule serialises it to a length-prefixed
//! binary format that supports `O(1)` append without ever re-encoding prior
//! entries.

use std::collections::{BTreeMap, HashMap, HashSet};

use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ─── Primitive identifiers ────────────────────────────────────────────────────

pub type NodeId = Uuid;
pub type EdgeId = Uuid;
pub type OpId   = Uuid;
pub type PeerId = Uuid;

// ─── Lamport Clock ────────────────────────────────────────────────────────────

/// Logical timestamp produced by a Lamport clock.
///
/// Totally ordered so it can be used as a sort key component.
#[derive(
    Debug, Clone, Copy, Default,
    PartialEq, Eq, PartialOrd, Ord, Hash,
    Serialize, Deserialize,
)]
pub struct LamportTs(pub u64);

/// Per-replica Lamport clock.  One instance lives on each peer.
///
/// ```rust
/// # use core_engine::crdt::LamportClock;
/// let mut clk = LamportClock::new();
/// let t1 = clk.tick();   // 1
/// let t2 = clk.tick();   // 2
/// assert!(t2 > t1);
/// ```
#[derive(Debug, Default)]
pub struct LamportClock {
    ts: u64,
}

impl LamportClock {
    pub fn new() -> Self {
        Self::default()
    }

    /// Increment and return the next timestamp for a **new local operation**.
    pub fn tick(&mut self) -> LamportTs {
        self.ts += 1;
        LamportTs(self.ts)
    }

    /// Advance the clock upon **receiving a remote timestamp**.
    ///
    /// Rule: `local = max(local, remote + 1)`.
    pub fn observe(&mut self, remote: LamportTs) {
        self.ts = self.ts.max(remote.0.saturating_add(1));
    }

    pub fn current(&self) -> LamportTs {
        LamportTs(self.ts)
    }
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

/// Metadata attached to a knowledge-graph node.
///
/// Uses [`BTreeMap`] (not `HashMap`) so property maps are always serialised in
/// the same canonical byte order — required for deterministic log encoding.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NodePayload {
    pub label: String,
    /// Arbitrary key-value metadata; keys are sorted lexicographically.
    pub properties: BTreeMap<String, String>,
}

impl NodePayload {
    pub fn new(label: impl Into<String>) -> Self {
        Self { label: label.into(), properties: BTreeMap::new() }
    }
}

// ─── Operation ────────────────────────────────────────────────────────────────

/// All possible mutations to the knowledge graph (the CRDT "event").
///
/// Operations are **immutable after creation** — they form the append-only log.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum OpKind {
    /// Create a new node, or supersede an older `InsertNode`/`UpdateNode`
    /// if the incoming timestamp is higher (LWW upsert).
    InsertNode {
        node_id: NodeId,
        payload: NodePayload,
    },

    /// Overwrite a node's metadata (LWW register keyed by `node_id`).
    /// Semantically equivalent to `InsertNode` for CRDT purposes.
    UpdateNode {
        node_id: NodeId,
        payload: NodePayload,
    },

    /// Add a directed edge `from → to` labelled `label`.
    ///
    /// Overridden by a concurrent-or-later `DeleteLink` for the same edge
    /// (**Delete-Wins** on timestamp tie).
    LinkNodes {
        edge_id: EdgeId,
        from:    NodeId,
        to:      NodeId,
        label:   String,
    },

    /// Permanently tombstone a directed edge.
    ///
    /// * If `ts` > the corresponding `LinkNodes` `ts` → delete wins.
    /// * If `ts` == the corresponding `LinkNodes` `ts` → **Delete-Wins** (conservative).
    /// * If `ts` < the corresponding `LinkNodes` `ts` → link wins (re-link scenario).
    DeleteLink {
        edge_id: EdgeId,
    },
}

/// A single CRDT operation with its causal metadata.
///
/// The three-tuple `(ts, peer, id)` forms a **total deterministic order**:
///
/// 1. `ts`   — causal ordering (Lamport clock)
/// 2. `peer` — tiebreaker across simultaneous ops from different replicas
/// 3. `id`   — final tiebreaker (UUID v4; two ops share ts+peer only during
///             clock mis-configuration, but `id` keeps ordering stable)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Operation {
    /// Globally unique operation ID — the deduplication key in `merge`.
    pub id: OpId,
    /// Lamport timestamp at the moment of creation on the issuing replica.
    pub ts: LamportTs,
    /// Issuing peer (replica) identifier.
    pub peer: PeerId,
    /// The mutation payload.
    pub kind: OpKind,
}

impl Operation {
    /// Construct an operation; generate a fresh random `id`.
    pub fn new(kind: OpKind, ts: LamportTs, peer: PeerId) -> Self {
        Self { id: Uuid::new_v4(), ts, peer, kind }
    }

    /// The sort key used for deterministic total ordering.
    ///
    /// All replicas sort the same log of `Operation`s identically, which is
    /// the foundation of merge convergence.
    #[inline]
    fn sort_key(&self) -> (LamportTs, PeerId, OpId) {
        (self.ts, self.peer, self.id)
    }
}

// Manual `Ord` so the sort key is `(ts, peer, id)` regardless of `kind`'s
// variant order.
impl PartialOrd for Operation {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Operation {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.sort_key().cmp(&other.sort_key())
    }
}

// ─── Materialised graph state ─────────────────────────────────────────────────

/// Live state of a single node (LWW register).
#[derive(Debug, Clone)]
pub struct NodeState {
    pub id:        NodeId,
    pub payload:   NodePayload,
    /// Sort key of the winning operation, kept for future delta merges.
    pub winner_ts:   LamportTs,
    pub winner_peer: PeerId,
}

/// Live state of a directed edge.
#[derive(Debug, Clone)]
pub struct EdgeState {
    pub id:    EdgeId,
    pub from:  NodeId,
    pub to:    NodeId,
    pub label: String,
}

/// The current graph, derived entirely from [`GraphState::log`].
///
/// Treat as **read-only** — to mutate the graph, produce new `Operation`s
/// and call [`merge`] again.
#[derive(Debug)]
pub struct GraphState {
    /// Live nodes keyed by `NodeId`.
    pub nodes: HashMap<NodeId, NodeState>,
    /// Live edges keyed by `EdgeId`.
    pub edges: HashMap<EdgeId, EdgeState>,
    /// Tombstone set for deleted edges; grows monotonically (append-only).
    pub deleted_edges: HashSet<EdgeId>,
    /// Canonical, deduplicated, sorted operation log.
    ///
    /// This is the **single source of truth** — persist only this field to
    /// reconstruct the full `GraphState` at any time by calling
    /// `merge(&log, &[])`.
    pub log: Vec<Operation>,
}

impl GraphState {
    fn new() -> Self {
        Self {
            nodes:         HashMap::new(),
            edges:         HashMap::new(),
            deleted_edges: HashSet::new(),
            log:           Vec::new(),
        }
    }

    /// Produce a stable, serializable snapshot for IPC boundaries.
    pub fn snapshot(&self) -> GraphSnapshot {
        let mut nodes: Vec<NodeSnapshot> = self
            .nodes
            .values()
            .map(|node| NodeSnapshot {
                id: node.id,
                label: node.payload.label.clone(),
                properties: node.payload.properties.clone(),
            })
            .collect();
        nodes.sort_unstable_by_key(|node| node.id);

        let mut edges: Vec<EdgeSnapshot> = self
            .edges
            .values()
            .map(|edge| EdgeSnapshot {
                id: edge.id,
                from: edge.from,
                to: edge.to,
                label: edge.label.clone(),
            })
            .collect();
        edges.sort_unstable_by_key(|edge| edge.id);

        let mut deleted_edges: Vec<EdgeId> = self.deleted_edges.iter().copied().collect();
        deleted_edges.sort_unstable();

        GraphSnapshot {
            nodes,
            edges,
            deleted_edges,
            op_count: self.log.len(),
        }
    }
}

/// Serializable node view for frontend IPC.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeSnapshot {
    pub id: NodeId,
    pub label: String,
    pub properties: BTreeMap<String, String>,
}

/// Serializable edge view for frontend IPC.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeSnapshot {
    pub id: EdgeId,
    pub from: NodeId,
    pub to: NodeId,
    pub label: String,
}

/// Portable CRDT graph snapshot for transport across process boundaries.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphSnapshot {
    pub nodes: Vec<NodeSnapshot>,
    pub edges: Vec<EdgeSnapshot>,
    pub deleted_edges: Vec<EdgeId>,
    pub op_count: usize,
}

/// Materialize and export a transport-safe snapshot from operation logs.
pub fn snapshot_from_ops(ops_a: &[Operation], ops_b: &[Operation]) -> GraphSnapshot {
    merge(ops_a, ops_b).snapshot()
}

// ─── Internal merge bookkeeping ───────────────────────────────────────────────

/// Transient per-edge bookkeeping accumulated while replaying the sorted log.
/// After processing all operations, [`materialize_edges`] converts these into
/// entries in `GraphState::edges` / `GraphState::deleted_edges`.
#[derive(Default)]
struct EdgeWip {
    /// Sort key + data for the latest `LinkNodes` op on this edge, if any.
    last_link: Option<(LamportTs, PeerId, OpId, EdgeState)>,
    /// Sort key for the latest `DeleteLink` op on this edge, if any.
    last_del:  Option<(LamportTs, PeerId, OpId)>,
}

// ─── merge ────────────────────────────────────────────────────────────────────

/// Merge two (possibly partial, possibly overlapping) operation sequences into
/// a single, consistent [`GraphState`].
///
/// # Example
///
/// ```rust
/// # use core_engine::crdt::*;
/// # use uuid::Uuid;
/// # use std::collections::BTreeMap;
/// let peer_a = Uuid::new_v4();
/// let peer_b = Uuid::new_v4();
/// let mut clk_a = LamportClock::new();
/// let mut clk_b = LamportClock::new();
///
/// let node_id = Uuid::new_v4();
///
/// // Peer A inserts a node at ts=1.
/// let op_a = Operation::new(
///     OpKind::InsertNode { node_id, payload: NodePayload::new("Star Alpha") },
///     clk_a.tick(),
///     peer_a,
/// );
///
/// // Peer B updates the same node at ts=2 (concurrent with A's ts=1).
/// let op_b = Operation::new(
///     OpKind::UpdateNode { node_id, payload: NodePayload::new("Star Alpha v2") },
///     clk_b.tick(),  // ts=1 on B's clock — same logical time as A's ts=1
///     peer_b,
/// );
///
/// let state = merge(&[op_a], &[op_b]);
/// // Convergent result: node exists with the payload from the higher (ts,peer) op.
/// assert!(state.nodes.contains_key(&node_id));
/// ```
pub fn merge(ops_a: &[Operation], ops_b: &[Operation]) -> GraphState {
    // ── 1. Deduplicate by op.id (union of both slices) ───────────────────────
    let mut seen: HashSet<OpId> =
        HashSet::with_capacity(ops_a.len() + ops_b.len());

    let mut log: Vec<Operation> = ops_a
        .iter()
        .chain(ops_b.iter())
        .filter(|op| seen.insert(op.id))
        .cloned()
        .collect();

    // ── 2. Deterministic total sort: (ts, peer, id) ──────────────────────────
    //
    // Every replica with the same logical log will produce the same sort order,
    // which is the foundation of convergence.
    log.sort_unstable();

    // ── 3. Replay in causal order ────────────────────────────────────────────
    let mut state     = GraphState::new();
    let mut edge_wips: HashMap<EdgeId, EdgeWip> = HashMap::new();

    for op in &log {
        apply_op(&mut state, &mut edge_wips, op);
    }

    // ── 4. Materialise edges (compare winning link vs delete sort keys) ───────
    materialize_edges(&mut state, edge_wips);

    // ── 5. Store the canonical log ───────────────────────────────────────────
    state.log = log;
    state
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/// Process a single operation against the mutable state.
///
/// Must be called in `(ts, peer, id)` ascending order for correctness.
fn apply_op(
    state:     &mut GraphState,
    edge_wips: &mut HashMap<EdgeId, EdgeWip>,
    op:        &Operation,
) {
    match &op.kind {
        // ── Node operations: LWW register ────────────────────────────────────
        //
        // `InsertNode` and `UpdateNode` share identical CRDT semantics:
        // both are point-in-time writes to the node's LWW register.
        // The operation with the higher `(ts, peer)` wins.
        OpKind::InsertNode { node_id, payload }
        | OpKind::UpdateNode { node_id, payload } => {
            let wins = state
                .nodes
                .get(node_id)
                .map_or(true, |existing| {
                    (op.ts, op.peer) > (existing.winner_ts, existing.winner_peer)
                });

            if wins {
                state.nodes.insert(
                    *node_id,
                    NodeState {
                        id:          *node_id,
                        payload:     payload.clone(),
                        winner_ts:   op.ts,
                        winner_peer: op.peer,
                    },
                );
            }
        }

        // ── Edge operations: record latest link and latest delete separately ──
        //
        // We intentionally do NOT collapse link vs delete here.
        // `materialize_edges` compares their sort keys after the full log
        // has been replayed, ensuring Delete-Wins on timestamp ties regardless
        // of which operation appears first in the sorted sequence.

        OpKind::LinkNodes { edge_id, from, to, label } => {
            let incoming_key = (op.ts, op.peer, op.id);
            let wip = edge_wips.entry(*edge_id).or_default();

            let is_newer = wip
                .last_link
                .as_ref()
                .map_or(true, |(ts, peer, id, _)| incoming_key > (*ts, *peer, *id));

            if is_newer {
                wip.last_link = Some((
                    op.ts,
                    op.peer,
                    op.id,
                    EdgeState {
                        id:    *edge_id,
                        from:  *from,
                        to:    *to,
                        label: label.clone(),
                    },
                ));
            }
        }

        OpKind::DeleteLink { edge_id } => {
            let incoming_key = (op.ts, op.peer, op.id);
            let wip = edge_wips.entry(*edge_id).or_default();

            let is_newer = wip
                .last_del
                .as_ref()
                .map_or(true, |(ts, peer, id)| incoming_key > (*ts, *peer, *id));

            if is_newer {
                wip.last_del = Some((op.ts, op.peer, op.id));
            }
        }
    }
}

/// Materialise final edge states after the full log replay.
///
/// ## Delete-Wins rule
///
/// Compare the sort keys of the latest `LinkNodes` and `DeleteLink` for each
/// edge.  The winner is the operation with the **strictly higher** sort key,
/// except on a **tie**, where `DeleteLink` wins (conservative / safe).
///
/// ```text
/// link.sort_key > del.sort_key  →  edge is LIVE
/// del.sort_key  >= link.sort_key →  edge is DELETED  (delete-wins on tie)
/// ```
fn materialize_edges(state: &mut GraphState, edge_wips: HashMap<EdgeId, EdgeWip>) {
    for (edge_id, wip) in edge_wips {
        match (wip.last_link, wip.last_del) {
            // Only a link op exists → edge is live.
            (Some((_, _, _, data)), None) => {
                state.edges.insert(edge_id, data);
            }

            // Only a delete op exists → edge is (or was) deleted.
            (None, Some(_)) => {
                state.deleted_edges.insert(edge_id);
            }

            // Both exist: compare sort keys.
            (Some((l_ts, l_peer, _, data)), Some((d_ts, d_peer, _))) => {
                let link_key = (l_ts, l_peer);
                let del_key  = (d_ts, d_peer);

                if link_key > del_key {
                    // LinkNodes is strictly newer → edge is live (re-link won).
                    state.edges.insert(edge_id, data);
                } else {
                    // DeleteLink is newer or equal → Delete-Wins.
                    state.deleted_edges.insert(edge_id);
                }
            }

            // Edge referenced by neither a link nor a delete (shouldn't happen
            // with the entry API, but be defensive).
            (None, None) => {}
        }
    }
}

// ─── Append-Only Log Codec ────────────────────────────────────────────────────

/// Binary codec for the append-only operation log.
///
/// ## Wire format
///
/// ```text
/// ┌──────────────────────────────────────────────────────┐
/// │ magic   : [u8; 4] = b"GFLW"                         │
/// │ version : u32 big-endian (current = 1)               │
/// ├──────────────────────────────────────────────────────┤
/// │ entry:                                               │
/// │   len     : u32 big-endian  (bytes in this entry)   │
/// │   payload : [u8; len]  (serde_json-encoded Operation)│
/// │   … repeated for every operation …                  │
/// └──────────────────────────────────────────────────────┘
/// ```
///
/// ## Append-only contract
///
/// To add a new operation to a persisted log, call [`log_codec::append`].
/// This is `O(1)` — it writes exactly `4 + payload_len` bytes and never
/// touches existing bytes.  The sandbox can `mmap` the buffer and stream-decode
/// new entries without seeking.
pub mod log_codec {
    use super::Operation;
    use anyhow::{bail, Context, Result};

    const MAGIC:   &[u8; 4] = b"GFLW";
    const VERSION: u32      = 1;
    const HEADER:  usize    = 8; // 4 magic + 4 version

    // ── Encoding ─────────────────────────────────────────────────────────────

    /// Encode a slice of operations into a fresh log buffer.
    pub fn encode(ops: &[Operation]) -> Result<Vec<u8>> {
        let mut buf = Vec::with_capacity(HEADER + ops.len() * 128);
        write_header(&mut buf);
        for op in ops {
            write_entry(&mut buf, op)?;
        }
        Ok(buf)
    }

    /// Append a **single** operation to an existing log buffer **in-place**.
    ///
    /// If `buf` is empty (freshly allocated), a header is written first.
    /// Otherwise only the length-prefixed entry is appended — `O(1)`.
    pub fn append(buf: &mut Vec<u8>, op: &Operation) -> Result<()> {
        if buf.len() < HEADER {
            write_header(buf);
        }
        write_entry(buf, op)
    }

    // ── Decoding ─────────────────────────────────────────────────────────────

    /// Decode all operations from a log buffer.
    ///
    /// Validates the magic bytes and version before reading entries.
    pub fn decode(bytes: &[u8]) -> Result<Vec<Operation>> {
        validate_header(bytes)?;

        let mut ops    = Vec::new();
        let mut cursor = HEADER;

        while cursor < bytes.len() {
            let (op, next) = read_entry(bytes, cursor)?;
            ops.push(op);
            cursor = next;
        }

        Ok(ops)
    }

    /// Decode entries starting from a **byte offset** into the log.
    ///
    /// Useful for tailing newly-appended entries without re-reading the full
    /// log.  Pass `HEADER` (= 8) to start from the very first entry.
    ///
    /// Returns decoded operations and the new cursor position.
    pub fn decode_from(bytes: &[u8], offset: usize) -> Result<(Vec<Operation>, usize)> {
        if offset < HEADER {
            bail!("offset {offset} is before end of header ({HEADER})");
        }

        let mut ops    = Vec::new();
        let mut cursor = offset;

        while cursor < bytes.len() {
            let (op, next) = read_entry(bytes, cursor)?;
            ops.push(op);
            cursor = next;
        }

        Ok((ops, cursor))
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    fn write_header(buf: &mut Vec<u8>) {
        buf.extend_from_slice(MAGIC);
        buf.extend_from_slice(&VERSION.to_be_bytes());
    }

    fn write_entry(buf: &mut Vec<u8>, op: &Operation) -> Result<()> {
        let payload = serde_json::to_vec(op).context("failed to serialise operation")?;
        let len = u32::try_from(payload.len())
            .context("operation payload exceeds 4 GiB")?;
        buf.extend_from_slice(&len.to_be_bytes());
        buf.extend_from_slice(&payload);
        Ok(())
    }

    fn validate_header(bytes: &[u8]) -> Result<()> {
        if bytes.len() < HEADER {
            bail!("log too short: {} bytes (expected at least {HEADER})", bytes.len());
        }
        if &bytes[..4] != MAGIC {
            bail!("invalid magic bytes: expected {:?}", MAGIC);
        }
        let version = u32::from_be_bytes(bytes[4..8].try_into().unwrap());
        if version != VERSION {
            bail!("unsupported log version {version} (expected {VERSION})");
        }
        Ok(())
    }

    fn read_entry(bytes: &[u8], cursor: usize) -> Result<(Operation, usize)> {
        if cursor + 4 > bytes.len() {
            bail!("truncated length prefix at offset {cursor}");
        }
        let len = u32::from_be_bytes(bytes[cursor..cursor + 4].try_into().unwrap()) as usize;
        let payload_start = cursor + 4;
        let payload_end   = payload_start + len;

        if payload_end > bytes.len() {
            bail!("truncated entry at offset {cursor}: expected {len} bytes, got {}",
                  bytes.len().saturating_sub(payload_start));
        }

        let op: Operation = serde_json::from_slice(&bytes[payload_start..payload_end])
            .with_context(|| format!("failed to deserialise operation at offset {cursor}"))?;

        Ok((op, payload_end))
    }

    /// Byte offset of the first entry (immediately after the header).
    pub const FIRST_ENTRY_OFFSET: usize = HEADER;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // ── Helpers ───────────────────────────────────────────────────────────────

    fn fixed_peer(n: u128) -> PeerId   { Uuid::from_u128(n) }
    fn fixed_node(n: u128) -> NodeId   { Uuid::from_u128(n) }
    fn fixed_edge(n: u128) -> EdgeId   { Uuid::from_u128(n) }

    fn payload(label: &str) -> NodePayload { NodePayload::new(label) }

    fn insert(node_id: NodeId, label: &str, ts: u64, peer: PeerId) -> Operation {
        Operation::new(
            OpKind::InsertNode { node_id, payload: payload(label) },
            LamportTs(ts),
            peer,
        )
    }

    fn update(node_id: NodeId, label: &str, ts: u64, peer: PeerId) -> Operation {
        Operation::new(
            OpKind::UpdateNode { node_id, payload: payload(label) },
            LamportTs(ts),
            peer,
        )
    }

    fn link(edge_id: EdgeId, from: NodeId, to: NodeId, ts: u64, peer: PeerId) -> Operation {
        Operation::new(
            OpKind::LinkNodes { edge_id, from, to, label: "relates".into() },
            LamportTs(ts),
            peer,
        )
    }

    fn delete_link(edge_id: EdgeId, ts: u64, peer: PeerId) -> Operation {
        Operation::new(OpKind::DeleteLink { edge_id }, LamportTs(ts), peer)
    }

    // ── Lamport Clock ─────────────────────────────────────────────────────────

    #[test]
    fn lamport_tick_increments() {
        let mut clk = LamportClock::new();
        assert_eq!(clk.tick(), LamportTs(1));
        assert_eq!(clk.tick(), LamportTs(2));
    }

    #[test]
    fn lamport_observe_advances() {
        let mut clk = LamportClock::new();
        clk.observe(LamportTs(10));
        assert_eq!(clk.current(), LamportTs(11));
        clk.observe(LamportTs(5)); // no-op: already ahead
        assert_eq!(clk.current(), LamportTs(11));
    }

    // ── CRDT: idempotency ─────────────────────────────────────────────────────

    /// merge(A, []) == merge(A, A)  (log lengths differ but graph is identical)
    #[test]
    fn merge_is_idempotent() {
        let p = fixed_peer(1);
        let n = fixed_node(1);
        let ops = vec![insert(n, "Star α", 1, p)];

        let s1 = merge(&ops, &[]);
        let s2 = merge(&ops, &ops);

        assert_eq!(s1.nodes.len(), 1);
        assert_eq!(s2.nodes.len(), 1);
        // Deduplication: log length must be 1 in both cases.
        assert_eq!(s1.log.len(), 1);
        assert_eq!(s2.log.len(), 1);
        assert_eq!(s1.nodes[&n].payload.label, s2.nodes[&n].payload.label);
    }

    // ── CRDT: commutativity ───────────────────────────────────────────────────

    /// merge(A, B) and merge(B, A) must produce the same node state.
    #[test]
    fn merge_is_commutative_nodes() {
        let p1 = fixed_peer(1);
        let p2 = fixed_peer(2);
        let n  = fixed_node(1);

        let a = vec![insert(n, "Version A", 1, p1)];
        let b = vec![update(n, "Version B", 2, p2)];

        let s_ab = merge(&a, &b);
        let s_ba = merge(&b, &a);

        // ts=2 wins: both must converge to "Version B".
        assert_eq!(s_ab.nodes[&n].payload.label, "Version B");
        assert_eq!(s_ba.nodes[&n].payload.label, "Version B");
    }

    /// merge(A, B) and merge(B, A) must produce the same edge state.
    #[test]
    fn merge_is_commutative_edges() {
        let p  = fixed_peer(1);
        let e  = fixed_edge(1);
        let n1 = fixed_node(1);
        let n2 = fixed_node(2);

        // Link at ts=3, delete at ts=5 → delete wins regardless of input order.
        let a = vec![link(e, n1, n2, 3, p)];
        let b = vec![delete_link(e, 5, p)];

        let s_ab = merge(&a, &b);
        let s_ba = merge(&b, &a);

        assert!(!s_ab.edges.contains_key(&e), "edge should be deleted");
        assert!(!s_ba.edges.contains_key(&e), "edge should be deleted");
        assert!(s_ab.deleted_edges.contains(&e));
        assert!(s_ba.deleted_edges.contains(&e));
    }

    // ── LWW: node conflict resolution ────────────────────────────────────────

    /// Higher timestamp always wins for node updates.
    #[test]
    fn node_lww_higher_ts_wins() {
        let p = fixed_peer(1);
        let n = fixed_node(1);

        let ops = vec![
            insert(n, "old", 1, p),
            update(n, "new", 5, p),
        ];

        let state = merge(&ops, &[]);
        assert_eq!(state.nodes[&n].payload.label, "new");
    }

    /// Equal timestamp: higher peer UUID wins.
    #[test]
    fn node_lww_peer_tiebreak() {
        // Peer UUIDs: p1 < p2 (from_u128 is deterministic).
        let p1 = fixed_peer(1);
        let p2 = fixed_peer(2);
        let n  = fixed_node(1);

        let ops = vec![
            insert(n, "from p1", 1, p1),
            insert(n, "from p2", 1, p2),  // same ts → p2 wins (higher UUID)
        ];

        let s1 = merge(&ops, &[]);
        let s2 = merge(&[ops[1].clone(), ops[0].clone()], &[]);

        assert_eq!(s1.nodes[&n].payload.label, "from p2");
        assert_eq!(s2.nodes[&n].payload.label, "from p2");
    }

    // ── Edge / Delete-Wins ────────────────────────────────────────────────────

    /// Concurrent link + delete at the same timestamp → Delete-Wins.
    #[test]
    fn delete_wins_on_concurrent_ops() {
        let p  = fixed_peer(1);
        let e  = fixed_edge(1);
        let n1 = fixed_node(1);
        let n2 = fixed_node(2);

        let lnk = link(e, n1, n2, 5, p);
        let del = delete_link(e, 5, p); // same ts → Delete-Wins

        // Try both orderings.
        let s1 = merge(&[lnk.clone()], &[del.clone()]);
        let s2 = merge(&[del.clone()], &[lnk.clone()]);

        assert!(!s1.edges.contains_key(&e), "delete-wins: edge must be absent");
        assert!(!s2.edges.contains_key(&e), "delete-wins: edge must be absent");
        assert!(s1.deleted_edges.contains(&e));
        assert!(s2.deleted_edges.contains(&e));
    }

    /// LinkNodes at higher ts re-establishes an edge after a Delete.
    #[test]
    fn relink_after_delete_with_higher_ts() {
        let p  = fixed_peer(1);
        let e  = fixed_edge(1);
        let n1 = fixed_node(1);
        let n2 = fixed_node(2);

        let ops = vec![
            link(e, n1, n2, 1, p),        // ts=1: create edge
            delete_link(e, 3, p),         // ts=3: delete edge
            link(e, n1, n2, 7, p),        // ts=7: re-link wins over delete
        ];

        let state = merge(&ops, &[]);
        assert!(state.edges.contains_key(&e),       "re-link should win");
        assert!(!state.deleted_edges.contains(&e),  "should not be tombstoned");
    }

    /// Older LinkNodes loses to a newer Delete.
    #[test]
    fn delete_with_higher_ts_wins_over_link() {
        let p  = fixed_peer(1);
        let e  = fixed_edge(1);
        let n1 = fixed_node(1);
        let n2 = fixed_node(2);

        let ops = vec![
            link(e, n1, n2, 7, p),   // ts=7
            delete_link(e, 9, p),    // ts=9: wins
        ];

        let state = merge(&ops, &[]);
        assert!(!state.edges.contains_key(&e));
        assert!(state.deleted_edges.contains(&e));
    }

    // ── log_codec ─────────────────────────────────────────────────────────────

    #[test]
    fn log_codec_encode_decode_roundtrip() {
        let p = fixed_peer(1);
        let n = fixed_node(1);

        let ops = vec![
            insert(n, "Alpha Centauri", 1, p),
            update(n, "Alpha Centauri v2", 2, p),
        ];

        let encoded = log_codec::encode(&ops).expect("encode");
        let decoded = log_codec::decode(&encoded).expect("decode");

        assert_eq!(ops.len(), decoded.len());
        assert_eq!(ops[0].id, decoded[0].id);
        assert_eq!(ops[1].id, decoded[1].id);
    }

    #[test]
    fn log_codec_append_is_incremental() {
        let p = fixed_peer(1);
        let n = fixed_node(1);

        let op1 = insert(n, "Node 1", 1, p);
        let op2 = update(n, "Node 1 updated", 2, p);

        // Build the log incrementally via append.
        let mut buf = Vec::new();
        log_codec::append(&mut buf, &op1).unwrap();
        log_codec::append(&mut buf, &op2).unwrap();

        let decoded = log_codec::decode(&buf).expect("decode");
        assert_eq!(decoded.len(), 2);
        assert_eq!(decoded[0].id, op1.id);
        assert_eq!(decoded[1].id, op2.id);
    }

    #[test]
    fn log_codec_tail_read_from_offset() {
        let p  = fixed_peer(1);
        let n1 = fixed_node(1);
        let n2 = fixed_node(2);

        let op1 = insert(n1, "A", 1, p);
        let op2 = insert(n2, "B", 2, p);

        let mut buf = log_codec::encode(&[op1]).expect("encode");
        let tail_offset = buf.len(); // remember offset before appending op2
        log_codec::append(&mut buf, &op2).expect("append");

        // Read only the new entry.
        let (new_ops, _) = log_codec::decode_from(&buf, tail_offset).expect("tail read");
        assert_eq!(new_ops.len(), 1);
        assert_eq!(new_ops[0].id, op2.id);
    }

    #[test]
    fn log_codec_rejects_bad_magic() {
        let mut buf = vec![0u8; 8];
        buf[0..4].copy_from_slice(b"XXXX");
        assert!(log_codec::decode(&buf).is_err());
    }

    // ── Full merge scenario ───────────────────────────────────────────────────

    /// Simulates two peers independently building a subgraph, then merging.
    #[test]
    fn full_scenario_two_peers_converge() {
        let p1 = fixed_peer(100);
        let p2 = fixed_peer(200);

        let star_a = fixed_node(10);
        let star_b = fixed_node(20);
        let star_c = fixed_node(30);
        let edge_ab = fixed_edge(1);
        let edge_bc = fixed_edge(2);

        // Peer 1 creates star_a, star_b and links them.
        let peer1_ops = vec![
            insert(star_a, "Sirius",   1, p1),
            insert(star_b, "Canopus",  2, p1),
            link(edge_ab, star_a, star_b, 3, p1),
        ];

        // Peer 2 creates star_c and links it to star_b, also deletes A→B link.
        let peer2_ops = vec![
            insert(star_c, "Arcturus",  1, p2),
            link(edge_bc, star_b, star_c, 2, p2),
            delete_link(edge_ab, 4, p2),   // deletes the A→B link at ts=4
        ];

        let state = merge(&peer1_ops, &peer2_ops);

        // All 3 nodes must be present.
        assert_eq!(state.nodes.len(), 3);
        assert!(state.nodes.contains_key(&star_a));
        assert!(state.nodes.contains_key(&star_b));
        assert!(state.nodes.contains_key(&star_c));

        // edge_ab was deleted at ts=4 > ts=3 (link) → deleted.
        assert!(!state.edges.contains_key(&edge_ab));
        assert!(state.deleted_edges.contains(&edge_ab));

        // edge_bc was never deleted → live.
        assert!(state.edges.contains_key(&edge_bc));

        // Canonical log length = 6 (no duplicates).
        assert_eq!(state.log.len(), 6);
    }
}
