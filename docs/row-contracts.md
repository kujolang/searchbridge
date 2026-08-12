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

Dynamic GA4 keys are constrained to string-or-null values because the requested dimensions and metrics determine their names. Generate downstream types from the schema matching the envelope's `capability`.
