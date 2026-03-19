use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Backup {
    pub id: String,
    pub file_name: String,
    pub file_path: String,
    pub created_at: String,
    pub profile_name: Option<String>,
    pub size_bytes: u64,
}
