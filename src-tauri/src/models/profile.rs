use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfilePermissions {
    pub allow: Vec<String>,
    pub deny: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileSettings {
    #[serde(default = "default_true")]
    pub auto_updater_enabled: bool,
    #[serde(default = "default_true")]
    pub include_co_authored_by: bool,
    #[serde(default)]
    pub preferred_notif_channel: String,
    #[serde(default)]
    pub has_completed_onboarding: bool,
    #[serde(default)]
    pub theme: String,
    #[serde(default)]
    pub verbose: bool,
    pub permissions: ProfilePermissions,
    #[serde(default)]
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub version: String,
    pub settings: ProfileSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileWithMeta {
    #[serde(flatten)]
    pub profile: Profile,
    pub id: Option<String>,
    pub file_name: String,
    pub file_path: String,
    pub is_active: bool,
    pub loaded_at: String,
    #[serde(default)]
    pub source: ProfileSource,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum ProfileSource {
    #[default]
    Bundled,
    Custom,
}

fn default_true() -> bool {
    true
}
