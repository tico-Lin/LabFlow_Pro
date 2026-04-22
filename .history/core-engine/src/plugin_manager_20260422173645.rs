use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub description: String,
    pub engine: String,
    pub execute_cmd: Vec<String>,
    pub supported_formats: Vec<String>,
    pub parameters: Value,
}

pub fn scan_plugins(plugins_dir: &Path) -> Vec<PluginManifest> {
    let mut plugins = Vec::new();

    let entries = match fs::read_dir(plugins_dir) {
        Ok(entries) => entries,
        Err(_) => return plugins,
    };

    for entry in entries.flatten() {
        let Ok(file_type) = entry.file_type() else {
            continue;
        };

        if !file_type.is_dir() {
            continue;
        }

        let manifest_path = entry.path().join("manifest.json");
        if !manifest_path.is_file() {
            continue;
        }

        let Ok(content) = fs::read_to_string(&manifest_path) else {
            continue;
        };

        let Ok(manifest) = serde_json::from_str::<PluginManifest>(&content) else {
            continue;
        };

        plugins.push(manifest);
    }

    plugins
}

pub fn execute_plugin(
    plugin: &PluginManifest,
    params_json: &str,
    target_blob_hash: Option<&str>,
) -> Result<String, String> {
    if plugin.execute_cmd.is_empty() {
        return Err(format!(
            "plugin '{}' has empty execute_cmd",
            plugin.id
        ));
    }

    let sandbox_dir = std::env::temp_dir().join(format!("labflow_run_{}", Uuid::new_v4()));
    fs::create_dir_all(&sandbox_dir)
        .map_err(|err| format!("failed to create sandbox {}: {err}", sandbox_dir.display()))?;

    let result = (|| {
        let params_path = sandbox_dir.join("params.json");
        fs::write(&params_path, params_json)
            .map_err(|err| format!("failed to write {}: {err}", params_path.display()))?;

        if let Some(blob_hash) = target_blob_hash {
            let blob_source = resolve_blob_path(blob_hash)?;
            let sandbox_input_path = sandbox_dir.join("input.dat");
            fs::copy(&blob_source, &sandbox_input_path).map_err(|err| {
                format!(
                    "failed to copy blob {} to {}: {err}",
                    blob_source.display(),
                    sandbox_input_path.display()
                )
            })?;
        }

        let mut cmd = Command::new(&plugin.execute_cmd[0]);
        if plugin.execute_cmd.len() > 1 {
            cmd.args(&plugin.execute_cmd[1..]);
        }
        cmd.arg(&sandbox_dir);

        let output = cmd
            .output()
            .map_err(|err| format!("failed to execute plugin '{}': {err}", plugin.id))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let detail = if !stderr.is_empty() {
                stderr
            } else if !stdout.is_empty() {
                stdout
            } else {
                "plugin process exited with failure and no output".to_string()
            };
            return Err(format!("plugin '{}' execution failed: {detail}", plugin.id));
        }

        let output_path = sandbox_dir.join("output.json");
        fs::read_to_string(&output_path)
            .map_err(|err| format!("failed to read {}: {err}", output_path.display()))
    })();

    let _ = fs::remove_dir_all(&sandbox_dir);
    result
}

fn resolve_blob_path(blob_hash: &str) -> Result<PathBuf, String> {
    let cwd = std::env::current_dir()
        .map_err(|err| format!("failed to resolve current directory: {err}"))?;
    let blob_dir = cwd.join(".labflow_blobs");

    if !blob_dir.is_dir() {
        return Err(format!(
            "blob directory does not exist: {}",
            blob_dir.display()
        ));
    }

    let exact_path = blob_dir.join(blob_hash);
    if exact_path.is_file() {
        return Ok(exact_path);
    }

    let entries = fs::read_dir(&blob_dir)
        .map_err(|err| format!("failed to read blob directory {}: {err}", blob_dir.display()))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let Some(file_name) = path.file_name().and_then(|name| name.to_str()) else {
            continue;
        };

        if file_name == blob_hash || file_name.starts_with(&format!("{blob_hash}.")) {
            return Ok(path);
        }
    }

    Err(format!("blob not found for hash: {blob_hash}"))
}