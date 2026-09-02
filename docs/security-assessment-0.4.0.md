# SearchBridge 0.4.0 security assessment

Assessment date: 2026-09-02  
Source revision: `a3fada31a430595a6d0e3e648fc62ccb315b7025` plus the security-control changes described here.

## Scope and method

The assessment covered the complete local CLI/SDK repository: command and
configuration parsing, mutation authorization, provider transports, built-in
and signed external adapters, response parsing/pagination, cache and task
state, evidence joins, telemetry, generated SDKs, workflows, and release
artifacts. The deployment boundary is the local operator or CI runner; no
hosted multi-tenant control plane exists.

The review combined manual source-to-sink inspection with deterministic
adversarial and property tests, local network/TLS fault simulation, dependency
audits, secret scanning, generated-contract validation, and release-governance
review. The reusable threat model is in `docs/threat-model.md`.

## Evidence

| Check | Result |
| --- | --- |
| `bash scripts/validate.sh` | Passed: 285 tests, 0 failures; network/TLS, permission, SDK, reliability, scale, 1,000-property, and governance gates passed. |
| `npm ci && npm audit --audit-level=high` (`sdk/typescript`) | Passed: 0 vulnerabilities. |
| `cargo audit` (`sdk/rust`) | Passed against 1,239 RustSec advisories; 12 locked dependencies scanned. |
| `trufflehog git file://... --only-verified --no-update` | Passed with TruffleHog 3.97.1: 771 chunks / 762,653 bytes; 0 verified and 0 unverified secrets. |
| `govulncheck ./...` (`sdk/go`) | The v1.7.0 client installed, but two local attempts timed out fetching `vuln.go.dev`; the pinned CI job remains the authoritative gate. A direct HTTPS HEAD request to the database succeeded. |
| Manual secret-pattern scan of tracked files | No AWS, Google, GitHub, private-key, or long bearer-token patterns found. |
| Codex Security Deep Scan | Could not start because the host did not provide the scanner's required managed read-only filesystem profile. No Deep Scan result is claimed. |

GitHub vulnerability alerts and automated security fixes were enabled when
checked. Code scanning was not yet configured; the committed CodeQL workflow
enables it when it first runs. Main-branch protection was absent at assessment
time; `.github/rulesets/main.json` defines the intended reviewed and checked
merge policy for application after required checks exist.

## Findings and disposition

No confirmed vulnerability was found in the assessed source. The assessment
added missing preventive controls: a vulnerability-reporting policy, explicit
repository threat model, ownership policy, dependency update configuration,
pinned CodeQL/dependency/secret workflows, deterministic security properties,
and a machine-readable branch ruleset.

The incomplete local Go advisory fetch, unavailable managed Deep Scan worker,
and not-yet-applied hosted GitHub controls are verification limitations, not
source findings. The dependency workflow and post-push repository-settings
verification must pass before the offline release gate is marked complete.
