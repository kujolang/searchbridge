# Changelog

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
