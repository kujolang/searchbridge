# SearchBridge 0.1.0 release qualification

Status: PASS for fixture/offline normalization and the documented optional live
provider adapters. Live-provider correctness, quotas, and credentials remain
external and are not claimed by this release.

The gate covers malformed URL/config values, timeouts, bounded retries,
429/5xx behavior, provider capability-level partial failure, deterministic
offline reruns, fixture immutability, row/output/token budgets, redacted errors,
and stale credential isolation. Every evidence command is read-only with
respect to providers. The sole effecting command, `submit`, requires the exact
capability `index.submission`, `--act`, `--yes`, and provider authorization on
every invocation; a receipt never claims indexing.

Run `bash scripts/validate.sh` and `python3 scripts/benchmark.py --iterations 100`.
