# SearchBridge next-session review — 0.3

The 0.2.1 production pass closes the previous backlog. These are deliberately
new, evidence-driven opportunities for the next session.

## P0 — operational proof

- [ ] Provision dedicated low-privilege provider test properties and GitHub environment secrets. **Done when:** the scheduled `live-contracts` workflow has a green run for all six read providers and its evidence artifact has been reviewed for redaction.
- [ ] Promote Kujo's URI encoder into the next tagged Kujo release. **Done when:** SearchBridge CI pins a published checksum-verified Kujo version instead of a source commit.
- [ ] Exercise and publish the first automated signed release. **Done when:** `v0.2.1` artifacts pass `git verify-tag`, checksums, `gh attestation verify`, archive extraction, and all three platform smokes.

## P1 — scale and extension

- [ ] Add a Kujo bounded worker-pool primitive to batch execution. **Done when:** independent reads overlap in wall-clock time while `--max-concurrency`, deterministic ordering, cancellation, and partial-success semantics remain proven.
- [ ] Add provider page iterators into the JSONL writer. **Done when:** live GSC/GA4 pages normalize and emit incrementally without materializing the full declared row budget.
- [ ] Add signed/encrypted replay-store backends. **Done when:** operators can enforce integrity, at-rest confidentiality, TTL deletion, and an allowlist of replayable capabilities.
- [ ] Load external declarative adapters from signed manifests. **Done when:** a third-party read adapter passes schema/conformance validation and executes under an endpoint/credential capability allowlist without source edits.

## P2 — adoption and insight

- [ ] Publish generated SDK types for TypeScript, Rust, and Go. **Done when:** a compatibility CI job compiles consumers against every golden envelope and row schema.
- [ ] Add OpenTelemetry export behind an explicit opt-in. **Done when:** traces and metrics preserve the existing no-URL/no-token/no-row privacy boundary and pass a redaction corpus.
- [ ] Add a local evidence query command. **Done when:** users can filter and join normalized JSONL/replay artifacts in Kujo without loading full files or introducing Python/Node runtime dependencies.
