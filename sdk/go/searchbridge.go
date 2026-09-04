package searchbridge

import "encoding/json"

type Provenance struct { Schema string `json:"schema"`; RunID string `json:"run_id"`; TraceID string `json:"trace_id"`; QueryFingerprint string `json:"query_fingerprint"`; ParentRunIDs []string `json:"parent_run_ids"`; ContractVersion string `json:"contract_version"` }

type MetricObservation struct { MetricID string `json:"metric_id"`; SemanticFamily string `json:"semantic_family"`; Value any `json:"value"`; Unit string `json:"unit"`; Estimated bool `json:"estimated"`; DefinitionVersion string `json:"definition_version"`; ComparisonKey *string `json:"comparison_key"`; SourceField string `json:"source_field"` }

type Result struct {
	Schema string `json:"schema"`
	Capability string `json:"capability"`
	Provider string `json:"provider"`
	Mode string `json:"mode"`
	RetrievedAt string `json:"retrieved_at"`
	Rows []json.RawMessage `json:"rows"`
	Provenance *Provenance `json:"provenance,omitempty"`
}

type Batch struct {
	Schema string `json:"schema"`
	BoundedConcurrency int `json:"bounded_concurrency"`
	Execution string `json:"execution"`
	CancelFile string `json:"cancel_file"`
	Succeeded int `json:"succeeded"`
	Failed int `json:"failed"`
	Results []json.RawMessage `json:"results"`
	Provenance *Provenance `json:"provenance,omitempty"`
}

type MultiResult struct { Schema string `json:"schema"`; Capability string `json:"capability"`; Routing json.RawMessage `json:"routing"`; Budget json.RawMessage `json:"budget"`; Succeeded int `json:"succeeded"`; Failed int `json:"failed"`; Results []json.RawMessage `json:"results"`; Provenance *Provenance `json:"provenance,omitempty"` }

type SupportTier string
const ( SupportTierStableLive SupportTier = "stable-live"; SupportTierFixtureOnly SupportTier = "fixture-only"; SupportTierExternalReference SupportTier = "external-reference"; SupportTierDisabled SupportTier = "disabled" )
type ProviderSupport struct { Provider string `json:"provider"`; SupportTier SupportTier `json:"support_tier"`; SupportReason string `json:"support_reason"` }
