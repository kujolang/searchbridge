# Contract design

## Compatibility decision

Keep `searchbridge.result/v1` readable and valid. Its schema permits additive envelope fields. Existing capability row schemas and golden documents remain unchanged. New capabilities receive new row schemas. Additive provenance fields become required by the new adapter conformance suite, but legacy v1 fixtures remain accepted by compatibility readers.

Do not introduce result v2 merely to expand providers. Introduce a new schema identifier only if an incompatible envelope change becomes unavoidable.

## Result additions

New adapter results add:

```json
{
  "contract": {"capability": "serp.results/v1", "adapter": "searchbridge-adapter/v2"},
  "source": {
    "provider": "serpapi",
    "provider_api_version": "current",
    "adapter_version": "1.0.0",
    "operation": "google-organic",
    "documentation_checked_at": "2026-09-02"
  },
  "query": {"fingerprint": "sha256:...", "locale": "en-US", "device": "desktop"},
  "budgets": {"calls": 1, "pages": 1, "rows": 100, "bytes": 1048576, "tokens": 25000},
  "routing": {"mode": "explicit", "selected": "serpapi", "candidates": ["serpapi"]}
}
```

The query block contains sanitized semantic parameters, never credential-bearing URLs or private raw bodies. The fingerprint is calculated after credential redaction.

## Metric observation

Use a shared `$defs/metric-observation` in every definition-sensitive capability:

| Field | Rule |
| --- | --- |
| `metric_id` | Required provider-qualified stable ID, such as `semrush.visibility_index`. |
| `semantic_family` | Required controlled family for discovery, not equivalence. |
| `value` | Number, string, boolean or null exactly as safely parsed. |
| `unit` | Required provider-documented unit or `unknown`. |
| `scale` | Optional min/max/direction. Never infer absent bounds. |
| `estimated` | Required boolean. |
| `period` | Optional start/end/granularity/time zone. |
| `definition_version` | Provider version/date/contract marker; `unknown` allowed. |
| `comparison_key` | Same key means arithmetic comparison is allowed; null means no equivalence claim. |
| `source_field` | Provider-native field name. |
| `source_note` | Short bounded caveat, not marketing prose. |

Provider raw values are not duplicated wholesale. Preserve the source field/value needed to audit mapping, and optionally a bounded `source_extra` object allowlisted by the row schema.

## New row contracts

- `rank.tracking/v1`: `keyword`, `target`, `engine`, `locale`, `device`, `observed_at`, `rank`, `ranking_url`, `project_id_hash`, `metrics`.
- `serp.results/v1`: `query`, `engine`, `locale`, `device`, `captured_at`, `result_type`, `rank_group`, `rank_absolute`, `url`, `title`, `snippet`, `features`, `metrics`.
- `domain.visibility/v1`: `target`, `scope`, `locale`, `observed_at`, `metrics`.
- `traffic.estimate/v1`: `target`, `geography`, `device`, `channel`, `period`, `metrics`, with every observation `estimated=true`.
- `edge.analytics/v1`: `zone_hash` or operator-approved zone label, host/path/time dimensions, `metrics`; request counts never get analytics semantic families.
- `crawl.data/v1`: provider run ID, URL, crawl time, status and facts/issues; vendor rule ID and severity are source fields, not SearchBridge judgments.

## Multi-provider container

Add `searchbridge.multi-result/v1`:

```json
{
  "schema": "searchbridge.multi-result/v1",
  "capability": "backlinks",
  "routing": {"mode": "all", "requested": ["ahrefs", "semrush"]},
  "budget": {"max_providers": 2, "max_total_rows": 1000},
  "succeeded": 1,
  "failed": 1,
  "results": [
    {"provider": "ahrefs", "ok": true, "value": {"schema": "searchbridge.result/v1"}},
    {"provider": "semrush", "ok": false, "error": {"code": "quota_exhausted", "retryable": false}}
  ]
}
```

Each successful `value` is a complete provider result. Ordering follows the resolved provider list. Errors are bounded, redacted and classified; no raw body is included.

## Adapter contract v2

The machine proposal is in `ADAPTER_CONTRACT_PROPOSAL.json`. Key decisions:

- contract and adapter versions are independent;
- operations declare exactly one capability and read/write class;
- external adapters are read-only;
- final request descriptors are revalidated by core;
- formats and pagination are finite enums;
- normalization is a bounded mapping DSL using JSON pointers/CSV columns, static values, typed coercions and metric-observation builders;
- packages include fixture hashes and signatures; publisher identity is a key fingerprint, not a display-name trust claim;
- minimum SearchBridge version is runtime metadata;
- cost, retention, health and schema compatibility are declared without prose bloat.

## Conformance behavior

An adapter proves “I implement capability X” by passing the capability schema against synthetic fixtures and by proving request descriptors, pagination, redaction, budgets, deterministic output and partial failure. Core tests do not special-case provider IDs except protocol fixtures required for its built-in packages.

## SDK generation

Generate new capability row unions, metric observations and multi-result types from schemas. Existing SDK names remain. Unknown additive source metadata must be preserved by generic decoders even when typed clients do not expose every field. Golden readers must accept all 0.2.x documents and new documents.
