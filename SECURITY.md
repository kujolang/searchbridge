# Security policy

## Supported versions

Security fixes are made on the current `1.x` line and on `main`; pre-1.0 lines
no longer receive routine fixes.

| Version | Supported |
| --- | --- |
| `1.x` | Yes |
| `< 1.0` | No |

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/kujolang/searchbridge/security/advisories/new).
Do not open a public issue for a suspected vulnerability. Include affected
versions, deployment assumptions, reproduction steps, impact, and a minimal
sanitized proof of concept. Never include provider credentials, authorization
headers, private response bodies, or credential-bearing URLs.

Maintainers will acknowledge a complete report within five business days,
validate and prioritize it, coordinate remediation with the reporter when
practical, and publish an advisory after a fix is available. No bounty or
specific disclosure deadline is promised.

## Security boundary

SearchBridge is a local CLI and SDK used by an operator, an agent, or CI. It is
not a hosted multi-tenant service, credential broker, or sandbox. Hosted RBAC,
tenant isolation, account lifecycle, regional control planes, and service
availability are outside this project's boundary.

Reportable issues include:

- credentials or sensitive provider data escaping through logs, errors,
  telemetry, cache keys, evidence metadata, or generated artifacts;
- an untrusted input causing network access outside an approved provider
  endpoint, credential forwarding, redirect following, or private-network
  access;
- bypass of adapter signatures, package digest checks, key revocation, or
  capability, endpoint, and credential allowlists;
- a mutation occurring without the command-specific capability plus explicit
  `--act --yes` confirmation;
- unbounded provider, retry, polling, response, parser, output, join, or disk
  consumption that defeats documented limits;
- unsafe local file handling, cache integrity failures, or release-artifact
  provenance/signature bypasses.

The operator remains responsible for host security, CI permissions, provider
account policy, environment-secret injection, output retention, and granting
only the filesystem and network access required by a run. Availability failures
of providers, incorrect provider data, and unsupported local modifications are
not vulnerabilities unless they cross one of the boundaries above.

See [docs/security.md](docs/security.md) and
[docs/threat-model.md](docs/threat-model.md) for implementation guidance and
the repository threat model.
