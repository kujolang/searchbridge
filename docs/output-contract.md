# Output contract

Every evidence command emits a `searchbridge.result/v1` object:

```json
{
  "schema": "searchbridge.result/v1",
  "capability": "search.performance",
  "provider": "google-search-console",
  "mode": "fixture",
  "retrieved_at": "2026-08-11T00:00:00Z",
  "property": "sc-domain:example.com",
  "dimensions": ["date", "query", "page"],
  "rows": []
}
```

Normalized rows retain source dimensions and measured metrics. A missing field
is omitted or null; it is never inferred. ACT receipts use
`searchbridge.submission/v1` and distinguish `received` from `indexed`.
