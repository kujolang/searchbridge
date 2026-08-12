use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeResult {
    pub schema: String,
    pub capability: String,
    pub provider: String,
    pub mode: String,
    pub retrieved_at: String,
    pub rows: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeBatch {
    pub schema: String,
    pub bounded_concurrency: u32,
    pub execution: Option<String>,
    pub cancel_file: Option<String>,
    pub succeeded: u32,
    pub failed: u32,
    pub results: Vec<Value>,
}
