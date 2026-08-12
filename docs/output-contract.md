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
- `searchbridge.adapter-conformance/v1`
- `searchbridge.batch/v1`
- `searchbridge.evidence-query/v1`

Result envelopes may include additive `pagination` and `telemetry` objects.
Pagination names the provider strategy and caller ceilings. Telemetry contains
only timing, retry, size, row, truncation, cache, and cost-class fields; it
never contains request URLs, headers, credentials, or row values.

`--format jsonl` emits one `searchbridge.row/v1` object per normalized row.
For live paginated GSC and GA4 calls, rows are normalized page-by-page into an
atomic output artifact; the returned in-process envelope does not retain the
full row set after the file is published. `evidence-query` emits bounded joined
or filtered rows under `searchbridge.evidence-query/v1`.

Opt-in OpenTelemetry uses OTLP JSON `resourceSpans` and `resourceMetrics`.
Those payloads are intentionally not evidence envelopes: they contain only
operational dimensions and never URLs, request/response material, or rows.
Capability row schemas live in [`../schemas/rows/`](../schemas/rows/), and
golden documents in `fixtures/golden/0.2/` are the executable compatibility
baseline for every public 0.2.x envelope.

Machine-readable JSON Schemas are in [`../schemas/`](../schemas/). Contract
changes require a new schema identifier; compatible provider fields and row
fields may be added without changing `searchbridge.result/v1`.
