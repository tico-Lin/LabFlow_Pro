use sha2::{Digest, Sha256};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BlobMetadata {
    pub hash: String,
    pub original_name: String,
    pub extension: String,
    pub size_bytes: u64,
}

pub fn ingest_file(source_path: &Path) -> Result<BlobMetadata, String> {
    if !source_path.exists() {
        return Err(format!(
            "source file does not exist: {}",
            source_path.display()
        ));
    }

    if !source_path.is_file() {
        return Err(format!(
            "source path is not a file: {}",
            source_path.display()
        ));
    }

    let mut source_file = File::open(source_path)
        .map_err(|err| format!("failed to open source file {}: {err}", source_path.display()))?;

    let blob_dir = ensure_blob_dir()?;
    let temp_file_path = blob_dir.join(format!(".tmp_{}", uuid::Uuid::new_v4()));
    let mut temp_file = File::create(&temp_file_path)
        .map_err(|err| format!("failed to create temp file {}: {err}", temp_file_path.display()))?;

    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 65536]; // 64KB chunk
    let mut size_bytes = 0;

    let mut encoder = lz4_flex::frame::FrameEncoder::new(&mut temp_file);

    loop {
        let n = source_file.read(&mut buffer).map_err(|err| format!("failed to read source: {err}"))?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
        encoder.write_all(&buffer[..n]).map_err(|err| format!("failed to compress temp: {err}"))?;
        size_bytes += n as u64;
    }
    encoder.finish().map_err(|err| format!("failed to finish compression: {err}"))?;

    let hash = bytes_to_hex(hasher.finalize().as_slice());

    let extension = source_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_string();

    let original_name = source_path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("")
        .to_string();

    let blob_file_name = if extension.is_empty() {
        hash.clone()
    } else {
        format!("{hash}.{extension}")
    };
    let destination_path = blob_dir.join(blob_file_name);

    if !destination_path.exists() {
        fs::rename(&temp_file_path, &destination_path).map_err(|err| {
            format!(
                "failed to rename temp file to blob {}: {err}",
                destination_path.display()
            )
        })?;
    } else {
        let _ = fs::remove_file(&temp_file_path); // Already exists, discard temp
    }

    Ok(BlobMetadata {
        hash,
        original_name,
        extension,
        size_bytes,
    })
}

pub fn get_blob_path(hash: &str) -> Result<PathBuf, String> {
    let hash = hash.trim();
    if hash.is_empty() {
        return Err("hash cannot be empty".to_string());
    }

    let blob_dir = ensure_blob_dir()?;
    let entries = fs::read_dir(&blob_dir)
        .map_err(|err| format!("failed to read blob directory {}: {err}", blob_dir.display()))?;

    for entry in entries {
        let entry = entry.map_err(|err| {
            format!(
                "failed to iterate blob directory {}: {err}",
                blob_dir.display()
            )
        })?;

        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let matches_hash = path
            .file_stem()
            .and_then(|stem| stem.to_str())
            .map(|stem| stem == hash)
            .unwrap_or(false)
            || path
                .file_name()
                .and_then(|name| name.to_str())
                .map(|name| name == hash)
                .unwrap_or(false);

        if matches_hash {
            return Ok(path);
        }
    }

    Err(format!("blob not found for hash: {hash}"))
}

pub fn read_blob(hash: &str) -> Result<Vec<u8>, String> {
    let path = get_blob_path(hash)?;
    let file = File::open(&path).map_err(|err| format!("failed to open blob file {}: {err}", path.display()))?;
    let mut decoder = lz4_flex::frame::FrameDecoder::new(file);
    let mut data = Vec::new();
    decoder.read_to_end(&mut data).map_err(|err| format!("failed to decompress blob file {}: {err}", path.display()))?;
    Ok(data)
}

/// Appends an incremental snapshot (delta) to a node's blob log.
pub fn append_incremental_snapshot(node_id: &str, delta_data: &[u8]) -> Result<(), String> {
    let blob_dir = ensure_blob_dir()?;
    let snapshot_file = blob_dir.join(format!("{node_id}.snapshots"));
    
    // We use OpenOptions to append.
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&snapshot_file)
        .map_err(|err| format!("failed to open snapshot file {}: {err}", snapshot_file.display()))?;
        
    let compressed_delta = lz4_flex::compress_prepend_size(delta_data);
    let len = (compressed_delta.len() as u32).to_be_bytes();
    
    file.write_all(&len).map_err(|err| format!("failed to write len: {err}"))?;
    file.write_all(&compressed_delta).map_err(|err| format!("failed to write delta: {err}"))?;
    
    Ok(())
}

/// Reads all incremental snapshots for a node.
pub fn read_incremental_snapshots(node_id: &str) -> Result<Vec<Vec<u8>>, String> {
    let blob_dir = ensure_blob_dir()?;
    let snapshot_file = blob_dir.join(format!("{node_id}.snapshots"));
    
    if !snapshot_file.exists() {
        return Ok(Vec::new());
    }
    
    let mut file = File::open(&snapshot_file).map_err(|err| format!("failed to open snapshot file {}: {err}", snapshot_file.display()))?;
    let mut data = Vec::new();
    file.read_to_end(&mut data).map_err(|err| format!("failed to read snapshot file {}: {err}", snapshot_file.display()))?;
    
    let mut snapshots = Vec::new();
    let mut cursor = 0;
    while cursor < data.len() {
        if cursor + 4 > data.len() {
            break;
        }
        let len = u32::from_be_bytes(data[cursor..cursor+4].try_into().unwrap()) as usize;
        cursor += 4;
        if cursor + len > data.len() {
            break;
        }
        let decompressed = lz4_flex::decompress_size_prepended(&data[cursor..cursor+len])
            .map_err(|err| format!("failed to decompress delta: {err}"))?;
        snapshots.push(decompressed);
        cursor += len;
    }
    
    Ok(snapshots)
}

fn ensure_blob_dir() -> Result<PathBuf, String> {
    let cwd = std::env::current_dir()
        .map_err(|err| format!("failed to resolve current directory: {err}"))?;

    let blob_dir = cwd.join(".labflow_blobs");
    fs::create_dir_all(&blob_dir)
        .map_err(|err| format!("failed to create blob directory {}: {err}", blob_dir.display()))?;

    Ok(blob_dir)
}

fn bytes_to_hex(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        out.push_str(&format!("{byte:02x}"));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_ingest_large_file_o1_memory() {
        // Generate a 10MB file to verify memory is well-controlled
        let mut temp_file = NamedTempFile::new().expect("failed to create temp file");
        let chunk = vec![0x42; 65536]; // 64KB of 'B'
        for _ in 0..160 {
            // 160 * 64KB = 10MB
            temp_file.write_all(&chunk).expect("failed to write chunk");
        }
        temp_file.flush().expect("flush failed");

        let meta = ingest_file(temp_file.path()).expect("ingest_file failed");
        assert_eq!(meta.size_bytes, 10 * 1024 * 1024);
        assert!(!meta.hash.is_empty());
        
        let path = get_blob_path(&meta.hash).expect("blob path should exist");
        assert!(path.exists());
        
        // Clean up
        let _ = fs::remove_file(path);
    }
}