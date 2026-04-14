use crate::crdt::{LamportClock, NodePayload, OpKind, Operation, PeerId};
use serde_json::json;
use uuid::Uuid;

/// Parse ASCII CSV-like input and convert each valid data row into CRDT insert operations.
///
/// Expected row format: `x,y` where both values are numeric.
/// The payload label stores a JSON-stringified point such as `{"x":1.0,"y":2.5}`.
pub fn ingest_ascii_data(ascii: &str, peer_id: PeerId) -> Vec<Operation> {
    let mut clock = LamportClock::new();
    let mut ops = Vec::new();

    for raw_line in ascii.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        let mut parts = line.split(',');
        let x = parts.next().and_then(|v| v.trim().parse::<f64>().ok());
        let y = parts.next().and_then(|v| v.trim().parse::<f64>().ok());

        let (x, y) = match (x, y) {
            (Some(x), Some(y)) => (x, y),
            _ => continue,
        };

        let payload_json = json!({ "x": x, "y": y }).to_string();
        let mut payload = NodePayload::new(payload_json);
        payload
            .properties
            .insert("ingest_format".to_string(), "ascii_csv".to_string());

        let op = Operation::new(
            OpKind::InsertNode {
                node_id: Uuid::new_v4(),
                payload,
            },
            clock.tick(),
            peer_id,
        );

        ops.push(op);
    }

    ops
}

#[cfg(test)]
mod tests {
    use super::ingest_ascii_data;
    use crate::crdt::log_codec;
    use uuid::Uuid;

    #[test]
    fn ingest_ascii_data_append_pipeline_roundtrip() {
        let input = "x,y\n1.0,2.5\n1.1,2.7\n1.2,2.9\n1.3,3.1\n1.4,3.4\n";
        let peer_id = Uuid::new_v4();

        let ops = ingest_ascii_data(input, peer_id);
        assert_eq!(ops.len(), 5);

        let mut buffer = Vec::<u8>::new();
        for op in &ops {
            log_codec::append(&mut buffer, op).expect("append should succeed");
        }

        assert!(!buffer.is_empty());

        let decoded = log_codec::decode(&buffer).expect("decode should succeed");
        assert_eq!(decoded.len(), 5);
    }
}
