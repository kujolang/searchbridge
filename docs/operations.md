# Operations runbook

This runbook covers SearchBridge as a local CLI/SDK in an agent or CI process.
Keep provider secrets in the runner's secret store, use least-privilege provider
accounts, and start with the fixture/offline commands below before enabling
network access.

## Agent and CI rollout

1. Verify the bundle checksum, extract it, and run `searchbridge version` plus
   `searchbridge doctor --health-policy fail --require-capabilities ...`.
2. Run the intended command with `--fixture --offline --deterministic` and the
   production row, byte, token, call, unit, page, poll, elapsed, and timeout
   budgets.
3. Supply only the provider credentials that job needs. Keep submissions out of
   generic agent tools; the MCP server and CLI both require the mutation
   capability plus `act` and `yes`.
4. Persist JSONL evidence and sanitized telemetry as CI artifacts. Never retain
   process environments, headers, cache encryption keys, or raw debug traces.
5. Treat exit 0 as success, exit 2 as usage/contract failure, and a configured
   `--degraded-exit-code` as an unavailable required capability. Multi-provider
   output may contain explicit partial failures even when useful results exist.

Use a cancellation file tied to CI cancellation, an ephemeral task-state
directory for paid asynchronous work, and `--health-policy fail` for required
capabilities. `examples/ci_quality_gate.kujo` shows direct typed Kujo embedding;
`docs/agent-mcp.md` documents the stdio MCP boundary.

## Replay lifecycle and recovery

Use encrypted replay only for approved capabilities and keep its key in the
runner secret store. Audit routinely:

```bash
searchbridge cache-maintenance --cache-dir .cache/searchbridge --cache-action audit
```

Migrate plaintext v1 records with `--cache-action migrate`, rotate with both
old and new key environment names, delete expired records with `cleanup`, and
quarantine malformed records with `recover`. Every changing operation requires
`--act --yes`. Back up the encrypted directory and key separately; a lost key
is intentionally unrecoverable. A tampered, expired, mismatched, or
non-allowlisted replay fails closed—collect fresh evidence rather than editing
the record.

## Evidence joins

Use nested joins for small inputs and `--join-strategy spill` for larger JSONL.
Place `--join-temp-dir` on an owner-only local volume, set
`--max-join-disk-bytes` below the runner quota, and keep `--max-total-rows`
bounded. SearchBridge parameterizes SQLite values and removes its temporary
database, but the operator owns input path approval and retention of the final
joined evidence. After an interrupted job, remove only verified
`searchbridge-join-*.sqlite` files from the dedicated temp directory.

## External adapter deployment

Validate and test an adapter in fixture mode first. Review every manifest
capability, exact endpoint, credential name/binding, cost, retention, retry, and
pagination limit. At invocation, repeat all three allowlists. Load publisher
public keys from environment variables; never ship private signing keys. Rotate
by overlapping old/new public keys, re-signing with the new fingerprint, and
then removing or adding the old fingerprint to
`SEARCHBRIDGE_ADAPTER_REVOKED_FINGERPRINTS`. Roll back the package and trust set
together; a manifest/file/signature mismatch must never be bypassed.

## Upgrade and rollback

Before upgrading, save the current verified bundle and checksum, audit the
cache, and run the new bundle against fixtures, golden contracts, SDK tests,
and a copy of replay/evidence state. Read the adapter compatibility and
deprecation report. Perform required cache migration only after the new version
passes; retain the old encrypted backup until the rollback window closes.

Rollback means selecting the previous immutable bundle and checksum, restoring
its compatible configuration and adapter trust set, and using unmodified cache
state from before a one-way migration. Do not move task receipts between
versions unless their schema and query identity are unchanged. Re-run `doctor`
and fixture smoke tests after either direction.

## Provider outage response

First distinguish provider unavailability from local contract failure using
`doctor`, sanitized telemetry, the provider status page, and the scheduled
metadata monitor. Do not raise retry caps: operation policies, call budgets,
`Retry-After`, and circuit breaking exist to prevent amplification and spend.

- For optional providers, use explicit multi-provider routing and consume
  successful partial results with their provider identity intact.
- For required evidence, fail the CI gate or use a recent approved encrypted
  replay with `--replay --offline`; never relabel stale replay as live.
- For paid async tasks, preserve the query-bound task state and resume bounded
  polling after recovery instead of reposting work.
- For schema drift, stop live consumption, retain sanitized response-shape
  evidence, update fixtures/contracts through review, and rerun all conformance
  gates before restoring the provider.
- Never switch to an unreviewed endpoint, adapter, credential, or raw API call
  during an incident.

Escalate credential exposure by revoking the provider credential, clearing
affected process/CI state, rotating cache encryption and adapter trust keys as
applicable, preserving sanitized evidence, and following `SECURITY.md`.
