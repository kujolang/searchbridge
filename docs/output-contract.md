# Output contracts

Every evidence command emits a `searchbridge.result/v1` object. The envelope is
stable across providers; capability-specific fields and normalized row shapes
are additive.

```json
{
  "schema": "searchbridge.result/v1",
  "capability": "search.performance",
  "provider": "google-search-console",
  "mode": "fixture",
  "retrieved_at": "1970-01-01T00:00:00Z",
  "property": "sc-domain:example.com",
  "dimensions": ["date", "query", "page"],
  "rows": []
}
```

Normalized rows retain source dimensions and measurements. A missing field is
`null` or absent; it is never inferred. `mode` is always `fixture` or `live`.
Deterministic mode uses `1970-01-01T00:00:00Z` so fixture output can be hashed,
cached, and compared exactly.

ACT receipts use `searchbridge.submission/v1`. Their authorization record
preserves the explicit capability and confirmation boundary. `received` means
the provider returned an accepted/success status; `indexed` is always false
because provider acceptance cannot prove indexing.

Discovery commands use separate versioned envelopes:

- `searchbridge.capabilities/v1`
- `searchbridge.providers/v1`
- `searchbridge.doctor/v1`

Machine-readable JSON Schemas are in [`../schemas/`](../schemas/). Contract
changes require a new schema identifier; compatible provider fields and row
fields may be added without changing `searchbridge.result/v1`.
