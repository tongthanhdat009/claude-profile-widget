use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeSettings {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_updater_enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_co_authored_by: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preferred_notif_channel: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_completed_onboarding: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub theme: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verbose: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub permissions: Option<SettingsPermissions>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub env: Option<HashMap<String, String>>,
    /// Catch-all for any extra fields
    #[serde(flatten)]
    pub extra: HashMap<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingsPermissions {
    #[serde(default)]
    pub allow: Vec<String>,
    #[serde(default)]
    pub deny: Vec<String>,
}
