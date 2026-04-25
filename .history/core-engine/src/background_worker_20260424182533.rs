use std::fs;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use rusqlite::{params, Connection};
use serde_json::json;

const BATCH_SIZE: i64 = 10;
const MIN_SLEEP_MS: u64 = 500;

pub fn spawn_alignment_daemon(db_path: PathBuf) {
    thread::spawn(move || {
        let blob_dir = db_path
            .parent()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".labflow_blobs");

        loop {
            let work_started_at = Instant::now();

            match Connection::open(&db_path) {
                Ok(conn) => {
                    let _ = fs::create_dir_all(&blob_dir);
                    let _ = run_alignment_batch(&conn, &blob_dir);
                }
                Err(_err) => {
                    // Keep daemon alive and retry in the next duty-cycle window.
                }
            }

            let work_time = work_started_at.elapsed();
            let throttled_sleep = Duration::from_secs_f64(work_time.as_secs_f64() * 9.0);
            let sleep_time = throttled_sleep.max(Duration::from_millis(MIN_SLEEP_MS));
            thread::sleep(sleep_time);
        }
    });
}

fn run_alignment_batch(conn: &Connection, blob_dir: &Path) -> rusqlite::Result<()> {
    let mut stmt = conn.prepare(
        "SELECT id, blob_hash, properties FROM nodes WHERE is_aligned = 0 LIMIT ?",
    )?;

    let pending_rows = stmt.query_map(params![BATCH_SIZE], |row| {
        let id: String = row.get(0)?;
        let blob_hash: String = row.get(1)?;
        let properties: Option<String> = row.get(2)?;
        Ok((id, blob_hash, properties))
    })?;

    for row in pending_rows {
        let (id, blob_hash, properties) = row?;
        if blob_exists(blob_dir, &blob_hash) {
            conn.execute(
                "UPDATE nodes SET is_aligned = 1, updated_at = ? WHERE id = ?",
                params![current_unix_ts(), id],
            )?;
            continue;
        }

        let merged = merge_alignment_status(properties.as_deref(), "ORPHANED", None);
        conn.execute(
            "UPDATE nodes SET properties = ?, updated_at = ?, is_aligned = 0 WHERE id = ?",
            params![merged, current_unix_ts(), id],
        )?;
    }

    Ok(())
}

fn blob_exists(blob_dir: &Path, blob_hash: &str) -> bool {
    let entries = match fs::read_dir(blob_dir) {
        Ok(entries) => entries,
        Err(_) => return false,
    };

    entries.filter_map(Result::ok).any(|entry| {
        let path = entry.path();
        if !path.is_file() {
            return false;
        }

        path.file_stem()
            .and_then(|stem| stem.to_str())
            .map(|stem| stem == blob_hash)
            .unwrap_or(false)
            || path
                .file_name()
                .and_then(|name| name.to_str())
                .map(|name| name == blob_hash)
                .unwrap_or(false)
    })
}

fn merge_alignment_status(
    existing_properties: Option<&str>,
    status: &str,
    message: Option<&str>,
) -> String {
    let mut value = existing_properties
        .and_then(|raw| serde_json::from_str::<serde_json::Value>(raw).ok())
        .unwrap_or_else(|| json!({}));

    if !value.is_object() {
        value = json!({});
    }

    if let Some(obj) = value.as_object_mut() {
        obj.insert("alignment_status".to_string(), json!(status));
        if let Some(msg) = message {
            obj.insert("alignment_error".to_string(), json!(msg));
        }
    }

    serde_json::to_string(&value).unwrap_or_else(|_| {
        json!({
            "alignment_status": "ERROR",
            "alignment_error": "failed to serialize alignment status"
        })
        .to_string()
    })
}

fn current_unix_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}