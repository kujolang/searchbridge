# SearchBridge 1.0.0 release-candidate qualification

Status: repository-local release candidate; public release and live-provider qualification are intentionally pending.

The v1 implementation freezes support tiers, stable contracts, compatibility, authentication lifecycle, deterministic Eval/Spec checks, platform bundles, SDK artifacts, SBOM, provenance, and approval-gated release automation. `bash scripts/validate.sh`, `bash scripts/version_consistency_gate.sh`, and `bash scripts/release_candidate_gate.sh` are the local acceptance gates.

## Proven local evidence

- The fixture-first provider and security suite covers normalized schemas, capability degradation, pagination, retries, row/call/unit/time bounds, redaction, replay, adapters, SDKs, MCP, and the `--act --yes` write boundary.
- `fixtures/golden/1.0` defines v1 producer output; immutable `fixtures/golden/0.2` documents remain readable.
- Release-candidate generation creates self-contained runtime bundles, TypeScript/Rust/Go SDK archives, checksums, SPDX SBOM, SLSA-format provenance, and reproducibility evidence.
- Platform CI builds Linux x64, macOS x64, macOS arm64, and Windows x64 bundles. Publication remains disabled unless the owner-controlled `SEARCHBRIDGE_PUBLIC_RELEASE_APPROVED` repository variable is true and the `public-release` environment approves the job.

## External evidence still required

No approved provider credentials or property identifiers were available in the repository session on 2026-09-04, so no live request was made and no live success is claimed. The strict provider-readiness gate lists the exact missing GSC, GA4, PageSpeed, and CrUX operation cases. Cloudflare remains fixture-only pending existing-plan dataset proof. IndexNow remains fixture-only pending one explicitly approved controlled submission. Three consecutive weekly read-only runs, protected-main CI links, final dependency/code/secret scan state, a signed `v1.0.0` tag, public assets, and independent public-download verification require external access or explicit release approval.

## Reserved release actions

Do not merge, tag, publish, or release from this document. After live evidence and CI are complete, the owner must approve the protected-main merge, signed tag, and public-release environment separately. The next deterministic local command is:

```bash
bash scripts/release_candidate_gate.sh
```
