# SearchBridge next-session review — 0.4

The provider expansion is fixture-complete, but the broader repository-local
production work is tracked in `docs/pre-live-production-roadmap.md`. Complete
that roadmap before treating live-provider proof as the only remaining gate.

## P0 — activate external proof

- [x] Remove the unpublished-runtime dependency from distribution. **Evidence:** self-contained bundles build the exact pinned Kujo source for each supported platform, verify reproducibility/checksums, and run offline after extraction; no `UNBLOCK_V1_RELEASE` directive is required for SearchBridge 0.4.
- [ ] Provision dedicated least-privilege properties/accounts for the six live read providers, install the documented GitHub environment secrets/variables, dispatch `live-contracts`, and review the sanitized artifact.
- [x] Retain independent release-candidate evidence before the next tag. **Evidence:** the `release-candidate` workflow starts from a clean checkout and retains checksummed, attested runtime/SDK artifacts, SBOM, provenance, and benchmarks for 90 days; the final tagged verification remains in the provider-dependent release gate.

## P1 — deepen scale guarantees

- [x] Add cursor/keyset iterator contracts for future providers whose pagination is neither offset-based nor bounded-list based.
- [x] Add a spillable hash-join strategy to `jsonl_query` for large joins while preserving explicit disk and row budgets.
- [x] Add envelope-level provenance chains linking query outputs, replay records, SDK versions, and OTLP run identifiers without exposing sensitive evidence.

## P2 — ecosystem adoption

- [x] Package the generated SDKs as independently versioned release assets with their own checksums and provenance subjects.
- [x] Publish two end-to-end Kujo examples: a CI regression gate using encrypted replay and an external signed-adapter starter.
- [x] Add an operator migration command that audits plaintext v1 replay records and rewrites approved records into encrypted v2 storage.
