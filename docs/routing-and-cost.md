# Routing, budgets, and cost

`fetch --capability ID --provider ID` is the safe default. It either runs that provider or fails; it never falls back. `--provider auto` requires an ordered `--route-preferences` list (or `[routing].preferences` in TOML), selects the first enabled capable provider, and records every candidate and reason. `--provider all` follows the same configured order and returns `searchbridge.multi-result/v1` with each provider envelope intact and every failure retained.

Use `--enabled-providers` or typed `[providers.NAME].enabled` configuration to narrow routing. `--max-providers` is capped at eight. Global rows are partitioned in stable provider order. Calls, retries, pages, rows, cursors, polls, elapsed time, concurrency, provider bytes and output bytes/tokens have hard bounds.

Cost classes are `free`, `quota`, `metered`, `expensive`, and `unknown`. Metered, expensive and unknown live calls fail before credential access and transport unless `--allow-paid`, a positive `--max-calls`, and a positive `--max-provider-units` are supplied. Estimated and actual provider units are separate fields; SearchBridge does not invent currency. Default validation and all fixtures perform zero billable calls.

Examples:

```bash
./searchbridge fetch --capability serp.results --provider serpapi --fixture --offline
./searchbridge fetch --capability serp.results --provider auto \
  --route-preferences serpapi,dataforseo --enabled-providers serpapi,dataforseo \
  --fixture --offline
./searchbridge fetch --capability serp.results --provider all \
  --route-preferences serpapi,dataforseo --fixture --offline
```
