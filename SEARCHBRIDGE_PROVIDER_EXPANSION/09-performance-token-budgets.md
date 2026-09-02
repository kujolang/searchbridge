# Performance and token budgets

## Audit baseline

Measured locally on 2026-09-02 with a clean archive build of the pinned Kujo commit `3bc5b4f1634d9883a789a0c2a0e6a266f72b77b2`:

- `scripts/benchmark.kujo -- --iterations 100`: 215.88 ms, 463.21 normalized GSC fixture operations/second, 56,800 output characters.
- launcher process wall time for `version`: five-run mean 0.086 seconds.
- checked-in provider and capability golden catalogs: 2,105 and 2,333 bytes (4,438 total).
- all current top-level and row schemas: 12,386 bytes.
- CLI help: 772 bytes.

Static evidence commands exited 0 with empty stdout in this pinned runtime, so live catalog-output sizes could not be remeasured; checked-in goldens are the valid baseline. Resolve this anomaly before accepting implementation benchmarks or CLI evidence claims.

## Hard budgets for batch 1

| Surface | Budget |
| --- | ---: |
| Warm fixture CLI startup, median | <= 350 ms; no more than 25% regression from verified pre-change baseline, whichever is stricter after anomaly closure |
| Provider discovery (20 providers), p95 | <= 20 ms in-process |
| Capability routing, p95 | <= 5 ms in-process |
| Full machine provider catalog | <= 16 KiB at 20 providers |
| Full machine capability catalog | <= 12 KiB |
| Agent-facing catalog | <= 4 KiB default; <= 160 tokens/capability and <= 80 tokens/provider on detailed lookup |
| CLI help | <= 4 KiB; provider details stay in subcommand/catalog output |
| All public schema files | <= 128 KiB |
| Single adapter manifest | <= 16 KiB; agent projection <= 512 bytes |
| Idle registry memory above current baseline | <= 4 MiB at 20 providers |
| JSON normalization | >= 150 small fixture operations/second on audit machine |
| CSV normalization | >= 25,000 rows/second for bounded synthetic rows |
| JSONL streaming retained evidence | <= one page plus 2 MiB working memory above runtime baseline |
| Default provider response | <= 8 MiB (current hard ceiling) |
| Default result | 1,000 rows, 1 MiB, 250,000 token compatibility ceiling; agent integrations default to 100 rows/25,000 tokens |
| Multi-provider | <= 8 providers, 1,000 total rows by default, bounded per-provider partition |
| Async task | <= 20 polls, <= 120 seconds total unless an explicit lower provider bound applies |
| Concurrency | default 4, hard maximum 32; provider maximum may lower it |

## Design constraints

- Discovery reads static safe metadata only; it never imports provider documentation, checks credentials or calls the network.
- Human docs, machine runtime metadata and agent descriptions are separate artifacts.
- Load built-in adapters lazily after routing where Kujo module behavior permits; never parse all fixtures at startup.
- Parser and normalizer work page-by-page. Multi-provider `all` streams provider partitions and retains only statuses plus bounded summaries.
- Schema generation occurs at build/release time, not first command execution.
- Provider descriptions contain capability IDs, cost class and required query fields—not endpoint inventories or marketing copy.

## Benchmark additions

Check in reproducible fixture benchmarks for registry discovery at 7/20/50 adapters, routing explicit/auto/all, JSON and CSV rows, cursor/task state machines, 100k-row JSONL streaming, multi-provider partial success and agent catalog serialization. Record machine/runtime metadata and compare medians over at least five repetitions. Fail only on stable threshold breaches, not noisy single-run timing.
