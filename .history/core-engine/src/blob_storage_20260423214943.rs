use sha2::{Digest, Sha256};
use std::fs;
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

    let file_bytes = fs::read(source_path)
        .map_err(|err| format!("failed to read source file {}: {err}", source_path.display()))?;

    let size_bytes = file_bytes.len() as u64;

    let digest = Sha256::digest(&file_bytes);
    let hash = bytes_to_hex(digest.as_slice());

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

    let blob_dir = ensure_blob_dir()?;
    let blob_file_name = if extension.is_empty() {
        hash.clone()
    } else {
        format!("{hash}.{extension}")
    };
    let destination_path = blob_dir.join(blob_file_name);

    if !destination_path.exists() {
        fs::write(&destination_path, &file_bytes).map_err(|err| {
            format!(
                "failed to write blob file {}: {err}",
                destination_path.display()
            )
        })?;
    }

    Ok(BlobMetadata {
        hash,
        original_name,
        extension,
        size_bytes,
    })
}

pub fn read_blob(hash: &str) -> Result<Vec<u8>, String> {
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
            return fs::read(&path)
                .map_err(|err| format!("failed to read blob file {}: {err}", path.display()));
        }
    }

    Err(format!("blob not found for hash: {hash}"))
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