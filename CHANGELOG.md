# Changelog

## 0.2.4 — 2026-08-12

- Included the Windows Kujo source-build prerequisite and exact `x64-windows-static-md` OpenSSL triplet in the qualified release source. Earlier signed tags remain immutable; `v0.2.4` is the final qualified 0.2.x release.

## 0.2.3 — 2026-08-12

- Supplied the required stable toolchain input to every pinned Rust setup action. The signed `v0.2.2` tag remains immutable; `v0.2.3` is the qualified release.

## 0.2.2 — 2026-08-12

- Corrected the full Kujo source pin used by validation, platform, monitoring, live-contract, and release workflows. The signed `v0.2.1` tag remains immutable; `v0.2.2` is the qualified release.

## 0.2.1 — 2026-08-12

- Added bounded native pagination, partial-success batches, streaming JSONL, cache/replay, structured secret-free telemetry, and CI health policies.
- Added declarative third-party adapter contracts, non-secret configuration profiles, public row schemas/examples, golden compatibility documents, and provider snapshots.
- Replaced local query escaping with Kujo's RFC 3986 UTF-8 `encode_uri_component` builtin.
- Added cross-platform launcher/package smoke, scheduled live contract checks, upstream drift issues, and signed-release checksum/SBOM/provenance automation.

## 0.2.0 - 2026-08-12

- Replaced the Python bridge, tests, JSON validator, and benchmark with native Kujo modules.
- Moved implementation into `src/` behind the stable root entrypoint.
- Hardened submission URL validation, disabled custom submission endpoints, and expanded secret redaction.
- Added exact UTF-8 output/response accounting, bounded transient retries, deterministic transport probes, and 131 native assertions.
- Rebuilt CI around a checksum-verified, pinned Kujo v1.0.1 binary.
- Expanded operator, security, architecture, qualification, and next-session documentation.

## 0.1.0 - 2026-08-11

- Initial normalized provider capability layer with offline fixtures and explicit ACT submission controls.
- Qualified malformed provider/submission inputs, offline deterministic reruns,
  scoped partial failure, timeouts, bounded retries, 429/5xx handling, output
  budgets, fixture immutability, and explicit capability + ACT authorization.
