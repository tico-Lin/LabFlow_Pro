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

/// Spawns a background thread to upload pending CRDT operations to the HostService
/// using an Exponential Backoff retry strategy.
pub fn spawn_upload_daemon(db_path: PathBuf) {
    thread::spawn(move || {
        let mut backoff = Duration::from_millis(500);
        let max_backoff = Duration::from_secs(60); // 1 minute max backoff

        loop {
            let mut success = true;

            match Connection::open(&db_path) {
                Ok(conn) => {
                    // Try to fetch pending operations
                    match run_upload_batch(&conn) {
                        Ok(processed_count) => {
                            if processed_count > 0 {
                                // Reset backoff on success
                                backoff = Duration::from_millis(500);
                            }
                        }
                        Err(err) => {
                            eprintln!("Upload batch failed: {err}");
                            success = false;
                        }
                    }
                }
                Err(err) => {
                    eprintln!("Failed to open DB for upload daemon: {err}");
                    success = false;
                }
            }

            if !success {
                // Apply exponential backoff
                thread::sleep(backoff);
                backoff = calculate_next_backoff(backoff, max_backoff);
            } else {
                // If we succeeded but there might be no more work, sleep minimally
                thread::sleep(Duration::from_millis(500));
            }
        }
    });
}

fn run_upload_batch(conn: &Connection) -> rusqlite::Result<usize> {
    // We assume operations are stored in an `ops_log` table with `uploaded = 0`
    // Mock implementation for the queue processing:
    let mut stmt = conn.prepare(
        "SELECT id, payload FROM ops_log WHERE uploaded = 0 ORDER BY created_at ASC LIMIT ?",
    );
    
    // If table doesn't exist yet, we just return 0 (it will be created by crdt initialization)
    if stmt.is_err() {
        return Ok(0);
    }
    
    let mut stmt = stmt?;
    let pending_rows = stmt.query_map(params![BATCH_SIZE], |row| {
        let id: String = row.get(0)?;
        let payload: String = row.get(1)?;
        Ok((id, payload))
    })?;

    let mut processed_count = 0;
    for row in pending_rows {
        let (id, _payload) = row?;
        
        // Mock network upload to HostService (gRPC)
        // In a real implementation, we'd use a tonic gRPC client here.
        let upload_success = mock_network_upload(&id);
        
        if upload_success {
            conn.execute(
                "UPDATE ops_log SET uploaded = 1 WHERE id = ?",
                params![id],
            )?;
            processed_count += 1;
        } else {
            // Stop processing this batch on first network failure to preserve order
            return Err(rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_IOERR),
                Some("Network upload failed".to_string())
            ));
        }
    }

    Ok(processed_count)
}

fn mock_network_upload(_id: &str) -> bool {
    // Simulate intermittent network failures
    let current_time = current_unix_ts();
    // E.g. fails every 5th second
    current_time % 5 != 0
}

pub fn calculate_next_backoff(current_backoff: Duration, max_backoff: Duration) -> Duration {
    (current_backoff * 2).min(max_backoff)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[test]
    fn test_exponential_backoff_calculation() {
        let max_backoff = Duration::from_secs(60);
        let mut backoff = Duration::from_millis(500);

        backoff = calculate_next_backoff(backoff, max_backoff);
        assert_eq!(backoff, Duration::from_millis(1000));

        backoff = calculate_next_backoff(backoff, max_backoff);
        assert_eq!(backoff, Duration::from_millis(2000));
        
        // Fast forward 4 more steps
        for _ in 0..4 {
            backoff = calculate_next_backoff(backoff, max_backoff);
        }
        assert_eq!(backoff, Duration::from_millis(32000));
        
        // Next step should cap at 60s
        backoff = calculate_next_backoff(backoff, max_backoff);
        assert_eq!(backoff, Duration::from_secs(60));
        
        // Stays capped
        backoff = calculate_next_backoff(backoff, max_backoff);
        assert_eq!(backoff, Duration::from_secs(60));
    }
}