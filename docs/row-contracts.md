# Capability row contracts

SearchBridge publishes one JSON Schema and canonical example for each normalized capability under `schemas/rows/` and `examples/rows/`. Provider-only fields are discarded unless the public row contract declares them; missing measurements remain `null`, never inferred.

| Capability | Schema | Example |
| --- | --- | --- |
| `search.performance` | `schemas/rows/search-performance.schema.json` | `examples/rows/search-performance.json` |
| `analytics` | `schemas/rows/analytics.schema.json` | `examples/rows/analytics.json` |
| `url.inspection` | `schemas/rows/url-inspection.schema.json` | `examples/rows/url-inspection.json` |
| `page.performance` | `schemas/rows/page-performance.schema.json` | `examples/rows/page-performance.json` |
| `field.performance` | `schemas/rows/field-performance.schema.json` | `examples/rows/field-performance.json` |
| `backlinks` | `schemas/rows/backlinks.schema.json` | `examples/rows/backlinks.json` |
| `keyword.data` | `schemas/rows/keyword-data.schema.json` | `examples/rows/keyword-data.json` |
| `index.submission` | `schemas/rows/index-submission.schema.json` | submission golden fixture |
| `rank.tracking` | `schemas/rows/rank-tracking.schema.json` | `examples/rows/rank-tracking.json` |
| `serp.results` | `schemas/rows/serp-results.schema.json` | `examples/rows/serp-results.json` |
| `domain.visibility` | `schemas/rows/domain-visibility.schema.json` | `examples/rows/domain-visibility.json` |
| `traffic.estimate` | `schemas/rows/traffic-estimate.schema.json` | `examples/rows/traffic-estimate.json` |
| `edge.analytics` | `schemas/rows/edge-analytics.schema.json` | `examples/rows/edge-analytics.json` |

Dynamic GA4 keys are constrained to string-or-null values because the requested dimensions and metrics determine their names. Generate downstream types from the schema matching the envelope's `capability`.

Definition-sensitive values use `schemas/metric-observation.schema.json`. A metric ID is provider-qualified. `semantic_family` aids discovery but never asserts equivalence. Arithmetic comparison is allowed only when two observations have the same non-null `comparison_key`; `null` explicitly means no equivalence claim. Traffic estimates always set `estimated` to `true`, and edge request counts use an edge-request semantic family rather than visits or sessions.

Multi-provider fetches use `schemas/multi-result.schema.json`. Each successful provider value remains an intact `searchbridge.result/v1` envelope; rows from different providers are never merged.
