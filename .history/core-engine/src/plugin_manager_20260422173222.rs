use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};
use serde_json::Value;

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