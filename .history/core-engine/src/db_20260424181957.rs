use std::path::Path;

use rusqlite::{Connection, Result};

pub fn init_db(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

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
        "#,
    )?;

    Ok(conn)
}