# SearchBridge next-session review — 0.4

The provider expansion is fixture-complete, but the broader repository-local
production work is tracked in `docs/pre-live-production-roadmap.md`. Complete
that roadmap before treating live-provider proof as the only remaining gate.

## P0 — activate external proof

- [ ] Provide the exact `UNBLOCK_V1_RELEASE` directive, publish Kujo v1.0.2, verify its four platform archives/checksums, and replace SearchBridge source-build pins with checksum-verified release downloads.
- [ ] Provision dedicated least-privilege properties/accounts for the six live read providers, install the documented GitHub environment secrets/variables, dispatch `live-contracts`, and review the sanitized artifact.
- [ ] Dispatch `independent-release-verification` for `v0.2.4`, retain the 90-day evidence artifact, then repeat it for the next SearchBridge release.

## P1 — deepen scale guarantees

- [ ] Add cursor/keyset iterator contracts for future providers whose pagination is neither offset-based nor bounded-list based.
- [ ] Add a spillable hash-join strategy to `jsonl_query` for large joins while preserving explicit disk and row budgets.
- [ ] Add envelope-level provenance chains linking query outputs, replay records, SDK versions, and OTLP run identifiers without exposing sensitive evidence.

## P2 — ecosystem adoption

- [ ] Package the generated SDKs as independently versioned release assets with their own checksums and provenance subjects.
- [ ] Publish two end-to-end Kujo examples: a CI regression gate using encrypted replay and an external signed-adapter starter.
- [ ] Add an operator migration command that audits plaintext v1 replay records and rewrites approved records into encrypted v2 storage.
