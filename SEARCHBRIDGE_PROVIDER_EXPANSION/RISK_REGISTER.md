# Risk register

| ID | Risk | Likelihood / impact | Mitigation and owner | Stop condition |
| --- | --- | --- | --- | --- |
| R1 | Registry refactor breaks stable commands/contracts | M / H | Vertical migration with old fixtures/goldens/SDK gates; implementation owner | Any old deterministic row or mutation boundary changes without approved contract decision |
| R2 | External DSL grows into unsafe arbitrary code | M / H | Finite schema, core-owned parser/transport, no shell/native loading; security owner | A required provider cannot be expressed without arbitrary execution—pause and redesign, do not bypass |
| R3 | Credential leaks through query/Basic/body auth | M / H | Placement-specific redaction corpus and credential-origin binding; security owner | Any secret appears in error, telemetry, cache key, trace, test artifact or command line output |
| R4 | Paid calls amplify through retry/poll/all/fallback | H / H | Total-call/unit/poll budgets, no silent fallback, explicit paid authorization; runtime owner | Provider cost cannot be bounded or preflight honestly |
| R5 | Vendor metrics imply false equivalence | H / H | Metric observations and comparison keys; schema owner | Generic authority/visibility/traffic field lacks source definition |
| R6 | Provider terms prohibit caching/redistribution | M / H | Per-provider legal/retention record; synthetic fixtures; release owner | Terms/entitlement unknown for a public live adapter or fixture provenance cannot be established |
| R7 | Cloudflare requests mislabeled as visits/users | M / H | Separate `edge.analytics` contract and tests; adapter owner | Any normalized field maps network requests to analytics sessions/users |
| R8 | Self-hosted Matomo/Umami origins reintroduce SSRF | M / H | External-only, exact invocation origin/path, strict network policy; security owner | Endpoint cannot be pinned/revalidated safely |
| R9 | Async provider task/download URL bypasses allowlist | M / H | Separate task and download endpoint rules, no credential forwarding; transport owner | Provider requires unbounded/unverifiable redirect/download host |
| R10 | Provider/catalog growth bloats startup and agent context | M / M | Separate human/machine/agent metadata; lazy adapters and budgets; performance owner | Catalog/benchmark exceeds acceptance budget without measured justification |
| R11 | API drift silently corrupts normalization | H / H | snapshots, type-path drift, live low-row probes, fail closed; provider owner | Required field disappears or meaning changes without a versioned mapping decision |
| R12 | Live verification is unavailable or expensive | H / M | fixture conformance, explicit external blocker, dedicated low-privilege accounts; release owner | Never substitute fabricated/live customer data; keep release status honest |
| R13 | Static CLI commands exit 0 with no stdout under audited runtime | M / H | Reproduce with pinned CI runtime in Phase 0 and fix separately if real; runtime owner | Do not accept output/token benchmarks or agent integration until resolved |
| R14 | Semrush v3/v4 and CSV differences create duplicate behavior | M / M | Operation-specific version, prefer v4 JSON, bounded CSV only as needed; adapter owner | Same semantic operation maps conflicting definitions without separate source metric IDs |
| R15 | SearchAtlas/product APIs pull SearchBridge into mutations/content | M / M | Exclude whole platform; future evidence-only external subset; product owner | Adapter requests project/content/listing/index workflow mutations through read path |

Open risks R6, R12 and R13 must be explicitly dispositioned in every release qualification. They are not reasons to weaken fixtures, cost controls or truthfulness.
