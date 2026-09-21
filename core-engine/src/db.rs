use std::path::Path;
use rusqlite::Result;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn init_db(db_path: &Path) -> Result<Pool<SqliteConnectionManager>, String> {
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::new(manager).map_err(|e| format!("Failed to create pool: {}", e))?;

    let conn = pool.get().map_err(|e| format!("Failed to get connection: {}", e))?;

    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS nodes (
            id TEXT PRIMARY KEY,
            node_type TEXT,
            blob_hash TEXT,
            properties TEXT,
            created_at INTEGER,
            updated_at INTEGER,
            is_aligned INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS edges (
            source_id TEXT,
            target_id TEXT,
            edge_type TEXT,
            PRIMARY KEY (source_id, target_id)
        );
        
        CREATE TABLE IF NOT EXISTS operations_log (
            op_id TEXT PRIMARY KEY,
            ts INTEGER NOT NULL,
            peer_id TEXT NOT NULL,
            payload BLOB NOT NULL
        );
        "#,
    ).map_err(|e| format!("Failed to initialize db schema: {}", e))?;

    Ok(pool)
}