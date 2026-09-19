use crate::crdt::{LamportClock, NodePayload, OpKind, Operation, PeerId};
use serde_json::{json, Map, Value};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstrumentFormat {
    XRD,
    CV,
    Unknown,
}

pub fn detect_format(raw_text: &str) -> InstrumentFormat {
    let preview = raw_text
        .lines()
        .take(50)
        .collect::<Vec<_>>()
        .join("\n")
        .to_ascii_lowercase();

    if preview.contains("2theta") || preview.contains("intensity") {
        InstrumentFormat::XRD
    } else if preview.contains("voltage")
        || preview.contains("current")
        || preview.contains("scan rate")
    {
        InstrumentFormat::CV
    } else {
        InstrumentFormat::Unknown
    }
}

fn instrument_format_name(format: InstrumentFormat) -> &'static str {
    match format {
        InstrumentFormat::XRD => "xrd",
        InstrumentFormat::CV => "cv",
        InstrumentFormat::Unknown => "unknown",
    }
}

fn normalize_metadata_key(key: &str) -> String {
    let mut normalized = String::with_capacity(key.len());
    let mut last_was_separator = false;

    for ch in key.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            normalized.push(ch.to_ascii_lowercase());
            last_was_separator = false;
        } else if !last_was_separator {
            normalized.push('_');
            last_was_separator = true;
        }
    }

    normalized.trim_matches('_').to_string()
}

fn extract_first_f64(text: &str) -> Option<f64> {
    text.split(|ch: char| {
        !(ch.is_ascii_digit() || ch == '.' || ch == '-' || ch == '+' || ch == 'e' || ch == 'E')
    })
    .find_map(|token| {
        if token.is_empty() {
            None
        } else {
            token.parse::<f64>().ok()
        }
    })
}

fn parse_numeric_pair(line: &str) -> Option<(f64, f64)> {
    let values = line
        .split(|ch: char| ch == ',' || ch == ';' || ch == '\t' || ch.is_whitespace())
        .filter(|token| !token.is_empty())
        .filter_map(|token| token.parse::<f64>().ok())
        .take(2)
        .collect::<Vec<_>>();

    match values.as_slice() {
        [x, y] => Some((*x, *y)),
        _ => None,
    }
}

fn capture_metadata_line(line: &str, metadata: &mut Map<String, Value>) {
    if let Some((key, value)) = line.split_once(':').or_else(|| line.split_once('=')) {
        let normalized_key = normalize_metadata_key(key);
        if !normalized_key.is_empty() && !value.trim().is_empty() {
            metadata.insert(normalized_key, json!(value.trim()));
        }
    }
}

pub fn parse_cv(text: &str) -> (Value, Vec<f64>, Vec<f64>) {
    let mut metadata = Map::new();
    let mut xs = Vec::new();
    let mut ys = Vec::new();

    metadata.insert("parser".to_string(), json!("cv"));

    for raw_line in text.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        let lower = line.to_ascii_lowercase();
        if lower.contains("scan rate") {
            capture_metadata_line(line, &mut metadata);
            if let Some(scan_rate) = extract_first_f64(line) {
                metadata.insert("scan_rate".to_string(), json!(scan_rate));
            }
        } else {
            capture_metadata_line(line, &mut metadata);
        }

        if lower.contains("voltage") {
            metadata.insert("x_label".to_string(), json!("Voltage"));
        }
        if lower.contains("current") {
            metadata.insert("y_label".to_string(), json!("Current"));
        }

        if let Some((x, y)) = parse_numeric_pair(line) {
            xs.push(x);
            ys.push(y);
        }
    }

    (Value::Object(metadata), xs, ys)
}

pub fn parse_xrd(text: &str) -> (Value, Vec<f64>, Vec<f64>) {
    let mut metadata = Map::new();
    let mut xs = Vec::new();
    let mut ys = Vec::new();

    metadata.insert("parser".to_string(), json!("xrd"));

    for raw_line in text.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        let lower = line.to_ascii_lowercase();
        capture_metadata_line(line, &mut metadata);

        if lower.contains("2theta") {
            metadata.insert("x_label".to_string(), json!("2Theta"));
        }
        if lower.contains("intensity") {
            metadata.insert("y_label".to_string(), json!("Intensity"));
        }

        if let Some((x, y)) = parse_numeric_pair(line) {
            xs.push(x);
            ys.push(y);
        }
    }

    (Value::Object(metadata), xs, ys)
}

pub fn parse_fallback(text: &str) -> (Value, Vec<f64>, Vec<f64>) {
    let mut xs = Vec::new();
    let mut ys = Vec::new();

    for raw_line in text.lines() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        if let Some((x, y)) = parse_numeric_pair(line) {
            xs.push(x);
            ys.push(y);
        }
    }

    (
        json!({
            "parser": "fallback",
            "x_label": "x",
            "y_label": "y"
        }),
        xs,
        ys,
    )
}

/// Parse ASCII instrument output and convert it into a single CRDT insert operation.
///
/// The payload label stores a JSON document containing detected format,
/// extracted metadata, and aligned numeric arrays.
pub fn ingest_ascii_data(ascii: &str, peer_id: PeerId) -> Vec<Operation> {
    let mut clock = LamportClock::new();

    let detected_format = detect_format(ascii);
    let (metadata, xs, ys) = match detected_format {
        InstrumentFormat::CV => parse_cv(ascii),
        InstrumentFormat::XRD => parse_xrd(ascii),
        InstrumentFormat::Unknown => parse_fallback(ascii),
    };

    if xs.is_empty() || ys.is_empty() {
        return Vec::new();
    }

    let point_count = xs.len();
    let payload_json = json!({
        "instrument_format": instrument_format_name(detected_format),
        "metadata": metadata,
        "data": {
            "x": xs,
            "y": ys
        }
    })
    .to_string();

    let mut payload = NodePayload::new(payload_json);
    payload.properties.insert(
        "ingest_format".to_string(),
        instrument_format_name(detected_format).to_string(),
    );
    payload
        .properties
        .insert("point_count".to_string(), point_count.to_string());

    vec![Operation::new(
        OpKind::InsertNode {
            node_id: Uuid::new_v4(),
            payload,
        },
        clock.tick(),
        peer_id,
    )]
}

#[cfg(test)]
mod tests {
    use super::{detect_format, ingest_ascii_data, InstrumentFormat};
    use crate::crdt::{log_codec, OpKind};
    use serde_json::Value;
    use uuid::Uuid;

    #[test]
    fn ingest_ascii_data_auto_routes_and_roundtrips() {
        let xrd_input = "# XRD export\nTitle: Powder Scan\n2Theta,Intensity\n10.0,1200\n10.5,1215\n11.0,1198\n";
        let cv_input = "Instrument: Potentiostat\nScan Rate: 50 mV/s\nVoltage,Current\n-0.10,0.001\n0.00,0.004\n0.10,0.009\n";
        let peer_id = Uuid::new_v4();

        assert_eq!(detect_format(xrd_input), InstrumentFormat::XRD);
        assert_eq!(detect_format(cv_input), InstrumentFormat::CV);

        let xrd_ops = ingest_ascii_data(xrd_input, peer_id);
        let cv_ops = ingest_ascii_data(cv_input, peer_id);
        assert_eq!(xrd_ops.len(), 1);
        assert_eq!(cv_ops.len(), 1);

        let mut buffer = Vec::<u8>::new();
        for op in xrd_ops.iter().chain(cv_ops.iter()) {
            log_codec::append(&mut buffer, op).expect("append should succeed");
        }

        assert!(!buffer.is_empty());

        let decoded = log_codec::decode(&buffer).expect("decode should succeed");
        assert_eq!(decoded.len(), 2);

        match &decoded[0].kind {
            OpKind::InsertNode { payload, .. } => {
                assert_eq!(payload.properties.get("ingest_format"), Some(&"xrd".to_string()));
                let payload_json: Value =
                    serde_json::from_str(&payload.label).expect("payload should be valid json");
                assert_eq!(payload_json["instrument_format"], "xrd");
                assert_eq!(payload_json["metadata"]["x_label"], "2Theta");
                assert_eq!(payload_json["data"]["x"].as_array().map(Vec::len), Some(3));
            }
            other => panic!("expected insert node, got {other:?}"),
        }

        match &decoded[1].kind {
            OpKind::InsertNode { payload, .. } => {
                assert_eq!(payload.properties.get("ingest_format"), Some(&"cv".to_string()));
                let payload_json: Value =
                    serde_json::from_str(&payload.label).expect("payload should be valid json");
                assert_eq!(payload_json["instrument_format"], "cv");
                assert_eq!(payload_json["metadata"]["scan_rate"], 50.0);
                assert_eq!(payload_json["data"]["y"].as_array().map(Vec::len), Some(3));
            }
            other => panic!("expected insert node, got {other:?}"),
        }
    }
}
