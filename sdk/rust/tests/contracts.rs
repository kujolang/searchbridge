use searchbridge_types::{SearchBridgeBatch, SearchBridgeResult};
use serde_json::Value;

const GOLDENS: &[(&str, &str)] = &[
    (
        "adapter-conformance",
        include_str!("../../../fixtures/golden/0.2/adapter-conformance.json"),
    ),
    (
        "batch",
        include_str!("../../../fixtures/golden/0.2/batch.json"),
    ),
    (
        "capabilities",
        include_str!("../../../fixtures/golden/0.2/capabilities.json"),
    ),
    (
        "doctor",
        include_str!("../../../fixtures/golden/0.2/doctor.json"),
    ),
    (
        "manifest",
        include_str!("../../../fixtures/golden/0.2/manifest.json"),
    ),
    (
        "providers",
        include_str!("../../../fixtures/golden/0.2/providers.json"),
    ),
    (
        "analytics",
        include_str!("../../../fixtures/golden/0.2/result-analytics.json"),
    ),
    (
        "backlinks",
        include_str!("../../../fixtures/golden/0.2/result-backlinks.json"),
    ),
    (
        "field-performance",
        include_str!("../../../fixtures/golden/0.2/result-field-performance.json"),
    ),
    (
        "keyword-data",
        include_str!("../../../fixtures/golden/0.2/result-keyword-data.json"),
    ),
    (
        "page-performance",
        include_str!("../../../fixtures/golden/0.2/result-page-performance.json"),
    ),
    (
        "search-performance",
        include_str!("../../../fixtures/golden/0.2/result-search-performance.json"),
    ),
    (
        "url-inspection",
        include_str!("../../../fixtures/golden/0.2/result-url-inspection.json"),
    ),
    (
        "submission",
        include_str!("../../../fixtures/golden/0.2/submission.json"),
    ),
];

const ROW_SCHEMAS: &[&str] = &[
    include_str!("../../../schemas/rows/analytics.schema.json"),
    include_str!("../../../schemas/rows/backlinks.schema.json"),
    include_str!("../../../schemas/rows/field-performance.schema.json"),
    include_str!("../../../schemas/rows/index-submission.schema.json"),
    include_str!("../../../schemas/rows/keyword-data.schema.json"),
    include_str!("../../../schemas/rows/page-performance.schema.json"),
    include_str!("../../../schemas/rows/search-performance.schema.json"),
    include_str!("../../../schemas/rows/url-inspection.schema.json"),
];

#[test]
fn every_golden_and_row_schema_compiles_into_a_consumer() {
    for (name, document) in GOLDENS {
        let value: Value =
            serde_json::from_str(document).unwrap_or_else(|error| panic!("{name}: {error}"));
        if value["schema"] == "searchbridge.result/v1" {
            serde_json::from_value::<SearchBridgeResult>(value).unwrap();
        } else if value["schema"] == "searchbridge.batch/v1" {
            serde_json::from_value::<SearchBridgeBatch>(value).unwrap();
        }
    }
    for schema in ROW_SCHEMAS {
        serde_json::from_str::<Value>(schema).unwrap();
    }
}
