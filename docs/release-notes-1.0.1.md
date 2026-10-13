# SearchBridge 1.0.1

SearchBridge 1.0.1 fixes evidence replay, call budgets, and release verification while preserving provider support tiers and result contracts.

## Upgrade

Recollect cached evidence after upgrading. Request fingerprints now use a new namespace to prevent keyword collisions; old cache entries cannot satisfy replay requests. Cache record formats and encryption keys remain unchanged. Submissions never reuse cached receipts.

## Changes

- Confine cache maintenance to valid record paths; bound cache and task reads, enforce encryption policy, and reject future timestamps.
- Enforce paid-call budgets in legacy signed adapters and require explicit live-call limits in MCP.
- Restore offline replay, publish output atomically, and fix quoted and Unicode CSV handling.
- Bound retry parsing and TypeScript SDK error retention; handle MCP framing and output backpressure.
- Verify signed tags, GitHub attestations, and source archive contents without extracting untrusted paths.
- Batch document validation and provide concise test receipts with opt-in assertion detail.
- Include a versioned Kennel package manifest and clearer installation and migration guidance.

## Compatibility and verification

The existing 300 assertions and new regression gates pass on the CI-pinned Kujo runtime. The audit compared 23 deterministic discovery/provider/submission envelopes with the previous source and found no changes. Linux, both macOS architectures, and Windows remain the supported runtime bundle platforms. Provider support tiers are unchanged; this patch does not promote fixture-only integrations.

Download the runtime bundle for your platform and verify its checksum before extraction. SDK archives, source archives, SPDX metadata, provenance, and attestations accompany the release.
