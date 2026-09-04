mod client;
pub use client::{read_json_lines, validate_result, SearchBridgeClient, SearchBridgeError};

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeProvenance { pub schema: String, pub run_id: String, pub trace_id: String, pub query_fingerprint: String, pub parent_run_ids: Vec<String>, pub contract_version: String }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricObservation { pub metric_id: String, pub semantic_family: String, pub value: Value, pub unit: String, pub estimated: bool, pub definition_version: String, pub comparison_key: Option<String>, pub source_field: String }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeResult {
    pub schema: String,
    pub capability: String,
    pub provider: String,
    pub mode: String,
    pub retrieved_at: String,
    pub rows: Vec<Value>,
    #[serde(default)]
    pub provenance: Option<SearchBridgeProvenance>,
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
    #[serde(default)]
    pub provenance: Option<SearchBridgeProvenance>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeMultiResult { pub schema: String, pub capability: String, pub routing: Value, pub budget: Value, pub succeeded: u32, pub failed: u32, pub results: Vec<Value>, #[serde(default)] pub provenance: Option<SearchBridgeProvenance> }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SearchBridgeSupportTier { StableLive, FixtureOnly, ExternalReference, Disabled }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchBridgeProviderSupport { pub provider: String, pub support_tier: SearchBridgeSupportTier, pub support_reason: String }
