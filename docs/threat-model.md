# SearchBridge threat model

Reviewed for the v1.0 release candidate on 2026-09-04.

## 1. Scope and security objectives

SearchBridge is a local CLI/SDK invoked by a human, agent, or CI runner. It
translates bounded requests into calls to approved search, analytics, and
performance providers; normalizes responses; and may write cache, task-state,
evidence, telemetry, and release artifacts. There is no hosted service or
tenant boundary in scope.

Security objectives are to keep provider credentials and sensitive rows out of
unapproved outputs, restrict egress to declared endpoints, make mutations
explicit, authenticate external adapter packages, fail closed on tampering,
bound resource and provider spend, and make release artifacts traceable to
source. Host compromise, a malicious privileged operator, provider-side
correctness, and provider availability are outside the trust guarantee.

Protected assets are provider credentials and quota, private analytics/search
data, cache and evidence contents, resumable task identifiers, the local host
and CI runner, adapter trust keys, and release provenance.

## 2. Architecture, actors, and trust boundaries

Trusted actors are the local operator/CI owner and reviewed maintainers.
Partially trusted actors are agent callers constrained by CLI arguments and
provider services constrained by response parsers and budgets. Untrusted input
may come from command arguments, configuration files, provider responses,
adapter packages, evidence JSONL, cached records, and downloaded dependencies.

The main trust boundaries are:

1. **Caller to CLI.** Option validation establishes numeric budgets and requires
   explicit confirmation for cache mutations (`src/cli.kujo:73-88`,
   `src/cli.kujo:170`). Submission receipts bind the mutation capability and
   confirmation (`src/commands.kujo:324`).
2. **CLI to network.** The transport disables redirects, denies private
   destinations, pins DNS, bounds response bytes, and enforces call/retry and
   circuit limits (`src/transport.kujo:41-105`). Endpoint validation requires
   exact approved ASCII HTTPS destinations (`src/protocols.kujo:3-15`).
3. **Adapter package to runtime.** Detached RSA signatures, package hashes,
   revocation, and explicit capability/endpoint/credential allowlists are
   checked before execution (`src/adapters.kujo:86-104`).
4. **Provider response to local data.** JSON/CSV structure, cell, byte, page,
   row, cursor, poll, and elapsed-time bounds apply before normalization
   (`src/protocols.kujo:25-68`, `src/adapters.kujo:249-285`).
5. **Runtime to persistent files.** Cache records bind their request identity
   and optionally use authenticated encryption (`src/cache.kujo:18-66`). Task
   records use derived filenames, atomic writes, age checks, and reject symlinks
   on reads (`src/task_state.kujo:4-16`). Spill joins reject a symlinked temp
   directory, use parameterized SQL, cap rows/line size/disk, and remove their
   database (`src/evidence.kujo:5-15`).
6. **Source to release.** CI checks source, dependencies, secrets, generated SDK
   compatibility, and release artifacts. CODEOWNERS identifies ownership of
   sensitive paths, while protected-branch policy requires pull requests and
   automated qualification checks.

## 3. Abuse cases and mitigations

| Scenario | Impact | Existing mitigation | Residual risk / required operation |
| --- | --- | --- | --- |
| Endpoint injection, DNS rebinding, redirect, or URL lookalike forwards a credential | Credential theft or internal-network access | Exact endpoint templates, ASCII HTTPS validation, no user-info/fragments, private-destination denial, DNS pinning, redirects disabled | Run with the supported Kujo network policy; live provider tests must confirm runtime enforcement on every supported platform. |
| A malicious adapter changes code/data or requests broader authority | Arbitrary egress or credential access | Canonical signed manifest, per-file hashes, key fingerprints, revocation, and three explicit allowlists | Operators control trusted public keys and must review new adapter authorities. |
| Provider sends deeply nested, oversized, malformed, repeated-cursor, or endless async data | Memory/CPU/disk exhaustion or stuck CI | 8 MiB response bound, structural/CSV bounds, page/row/call/poll/time budgets, cursor-repeat rejection, cancellation, circuit breaker | A currently executing request lasts until its timeout; callers should set budgets below CI job limits. |
| Secrets leak through error strings, fingerprints, telemetry, cache, or fixtures | Provider-account compromise | Central redaction, credential-independent request hashes, bounded operational telemetry, adversarial corpus, property tests, secret scanning | Caller-selected evidence/output may intentionally contain provider data and requires operator retention controls. |
| Cache/task/evidence files are replaced, linked, corrupted, or replayed | Data disclosure, wrong result, local file damage | Owner-only directory gate, atomic writes, schema/identity/integrity/age checks, symlink rejection on critical paths, explicit maintenance confirmation | The local OS account and chosen parent directories remain trusted; use ephemeral CI directories and cache encryption for sensitive rows. |
| SQL or JSONL content attacks spill joins | Query manipulation or resource exhaustion | Parameterized SQL, JSON parsing, 1 MiB line and 100,000-row bounds, disk budget, generated database name, cleanup | Evidence paths themselves are operator-approved local inputs. |
| An agent triggers indexing or paid calls silently | External mutation or unexpected cost | Separate submission capability, `--act --yes`, paid enablement, call/provider-unit budgets, fixture mode with zero cost | The invoking operator determines whether an agent may pass confirmation and paid flags. |
| Fixture coverage is mistaken for qualified live support | Unverified provider use or unexpected external behavior | Machine-readable support tiers; automatic live routing admits only `stable-live`; direct unverified live calls require an explicit flag | Stable-live claims still require current sanitized operation evidence before release. |
| A long-lived CI credential is exposed | Provider-account access | Google workflow uses scoped workload identity and a short-lived token, does not create a credentials file, and cleans up defensively | Repository/environment trust policy and provider property roles remain owner-administered controls. |
| A compromised dependency, workflow, or release artifact reaches users | Local code execution or forged distribution | Pinned workflow actions, dependency review/audits, CodeQL, secret scanning, SBOM, checksums, signatures, provenance, protected branch/tags | GitHub repository settings and signing keys are administrative controls and must be reviewed before each release. |

No validated vulnerability was identified while constructing this model. Items
described as residual risk are deployment obligations or hypotheses for future
testing, not confirmed findings.

## 4. Verification and maintenance

`scripts/validate.sh` runs the repository tests, contract/schema gates, local
network-fault and file-permission probes, SDK compatibility, scale/reliability
qualification, and deterministic URL/JSON/CSV/cache/redaction/signature
properties. The security workflow adds CodeQL, dependency review and audits,
and verified-secret scanning. Review this model whenever a provider protocol,
credential shape, mutation, persistent store, network policy, adapter contract,
distribution platform, or release process changes.

Repository: 2903d44dd97984fa785dc08365a9605991ff862ba7f227b43bae332f3b2034fd
Version: a3fada31a430595a6d0e3e648fc62ccb315b7025
