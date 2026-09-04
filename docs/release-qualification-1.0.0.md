# SearchBridge 1.0.0 release qualification

Status: approved for public release on 2026-09-04 with the stable-live provider matrix qualified and the explicitly named v1.1 follow-ups preserved.

The v1 implementation freezes support tiers, stable contracts, compatibility, authentication lifecycle, deterministic Eval/Spec checks, platform bundles, SDK artifacts, SBOM, provenance, and approval-gated release automation. `bash scripts/validate.sh`, `bash scripts/version_consistency_gate.sh`, and `bash scripts/release_candidate_gate.sh` are the local acceptance gates.

## Proven local evidence

- The fixture-first provider and security suite covers normalized schemas, capability degradation, pagination, retries, row/call/unit/time bounds, redaction, replay, adapters, SDKs, MCP, and the `--act --yes` write boundary.
- `fixtures/golden/1.0` defines v1 producer output; immutable `fixtures/golden/0.2` documents remain readable.
- Release-candidate generation creates self-contained runtime bundles, TypeScript/Rust/Go SDK archives, checksums, SPDX SBOM, SLSA-format provenance, and reproducibility evidence.
- Platform CI builds Linux x64, macOS x64, macOS arm64, and Windows x64 bundles. Publication still requires the owner-controlled `SEARCHBRIDGE_PUBLIC_RELEASE_APPROVED` repository variable and the `public-release` environment.

## Proven live evidence

The owner-authorized [live-contract run 33906223660](https://github.com/kujolang/searchbridge/actions/runs/33906223660) passed all 16 operation cases on commit `9b7d5b8bc241fd6e02d8ea301cbcdde06b859838`: GSC (5), GA4 (3), PageSpeed Insights (3), and CrUX (5). The workflow uses short-lived Google workload identity, restricted API keys, bounded empty and non-empty windows, and sanitized receipts; no provider rows or credentials are retained in the repository.

## Owner-approved v1.1 follow-ups

The owner explicitly chose to publish v1.0.0 and review these items in v1.1:

- accumulate three consecutive scheduled weekly read-only runs;
- prove a Cloudflare Analytics query that returns an eligible dataset under the existing account and plan;
- perform one controlled IndexNow write-path exercise with explicit `--act --yes` authorization.

Cloudflare and IndexNow therefore remain `fixture-only` in v1.0. No live success is claimed for them, and no submission was made. The authoritative follow-up list is [v1.1-review-checklist.md](v1.1-review-checklist.md).

## Release verification

The release must be cut from the exact reviewed `main` commit with an annotated verified signature. The tag workflow is the only publisher of runtime bundles, SDK archives, checksums, SBOM, provenance, and attestations. After publication, run the independent-release-verification workflow against `v1.0.0`; record the immutable release and workflow links here in the post-release documentation update.

The deterministic local command is:

```bash
bash scripts/release_candidate_gate.sh
```
