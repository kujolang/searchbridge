# SearchBridge provider expansion package

Status: architecture and research package, 2026-09-02. No provider implementation is included.

## Decision

SearchBridge should be positioned technically as a **provider-neutral web intelligence gateway**. It collects bounded provider evidence, normalizes it at semantic capability boundaries, preserves provider and metric provenance, and exposes inspectable routing. It is not an SEO recommendation engine, data warehouse, crawler, dashboard, credential broker, or managed service.

The existing adapter system should become the one canonical extension system. Built-in and signed external adapters must implement the same versioned contract and use core-owned transport, budgets, redaction, cache/replay, telemetry, and output envelopes. Do not add a second plugin or connector framework.

## First implementation batch

1. **DataForSEO** (built-in): proves JSON, synchronous and asynchronous task flows, SERP plus keyword data, explicit cost preflight, and high-volume pagination.
2. **Semrush** (built-in): proves CSV/JSON parsing, per-line unit accounting, rank/domain/backlink evidence, and provider-specific retention policy.
3. **SerpApi** (built-in): proves real-time `serp.results`, engine/location parameters, and per-search budgets.
4. **Cloudflare Analytics** (built-in): proves GraphQL request construction and `edge.analytics`, which must remain distinct from session analytics.
5. **Plausible** (signed reference adapter): proves that the external adapter path can ship a useful read-only analytics provider without core source edits.

This batch maximizes architecture coverage. It is not permission to make paid live calls in CI. Fixtures are mandatory; low-row live tests remain credential-gated and opt-in.

## Package map

- `01-current-architecture.md`: repository ownership map, current providers, and scaling blockers.
- `02-provider-research.md`: current API facts and source links; unknown commercial terms are explicit.
- `03-capability-taxonomy.md`: canonical capability IDs and deliberate exclusions.
- `04-provider-priorities.md`: weighted model, tiers, batches, and built-in/external decisions.
- `05-target-architecture.md`: registry, adapter lifecycle, routing, configuration, agent/MCP/WebOps integration, and drift.
- `06-contract-design.md`: normalized envelopes, metric provenance, multi-provider results, and adapter authoring.
- `07-security-review.md`: threat review and required controls.
- `08-testing-plan.md`: provider conformance and release gates.
- `09-performance-token-budgets.md`: measured baseline and hard budgets.
- `10-distribution-opportunities.md`: audiences and evidence-backed channel classification.
- `IMPLEMENTATION_PLAN.md`: dependency-ordered vertical slices.
- `IMPLEMENTATION_PROMPT.md`: bounded handoff prompt for the implementation agent.
- `ACCEPTANCE_CRITERIA.md`: objective completion gates.
- `RISK_REGISTER.md`: owned risks and stop conditions.
- JSON files: machine-readable provider, capability, and adapter-contract proposals.

## Answers to the 25 final questions

1. **Today:** a Kujo-native, CLI-first, fixture-first gateway for seven providers and eight evidence capabilities, with bounded transport, stable envelopes, replay, JSONL, telemetry, batch reads, and explicit mutation controls.
2. **Already an abstraction:** capability IDs, provider catalog, common result envelope, row schemas, discovery, common transport, fixtures, replay, telemetry, and signed external read manifests.
3. **Blockers to 20 providers:** provider routing is hard-coded across CLI and command functions; normalizers are command-local; the external adapter can only issue one static JSON request and pass through a `rows_field`; there is no cursor/task pagination, CSV parser, GraphQL operation descriptor, provider-scoped configuration, cost preflight, or per-metric provenance contract.
4. **Does the external adapter solve it?** It is the correct trust boundary and canonical seed, but its v1 execution contract is insufficient for production providers.
5. **Change first:** extract one registry/adapter runtime, publish conformance fixtures, add semantic fetch/routing, per-metric provenance, provider cost policies, and adapter manifest v2.
6. **Durable taxonomy:** retain the eight IDs; add `rank.tracking`, `serp.results`, `domain.visibility`, `traffic.estimate`, `edge.analytics`, and `crawl.data` only. Details are in `03-capability-taxonomy.md`.
7. **Belong:** provider APIs that return search, first-party analytics, performance, backlink, keyword, indexing, SERP, rank, domain-visibility, estimated-traffic, edge, or crawl evidence under bounded read contracts.
8. **Do not belong:** content generation, dashboards, CRM/listing management, ad campaign mutation, generic product analytics, raw browser automation, billing, and vendor workflow/project administration.
9. **Built-in:** the current providers plus DataForSEO, Semrush, SerpApi, Cloudflare Analytics; later Similarweb where licensing is approved. Built-in means high-demand, stable, security-sensitive or protocol-complex, and maintained with live drift coverage.
10. **External:** Plausible reference adapter first; Moz, Matomo, Fathom, Umami, Sistrix, Majestic, AccuRanker, and SearchAtlas evidence-only subsets unless adoption and maintenance justify promotion.
11. **Routing:** explicit provider by default; deterministic configured `auto`; `all` for comparison. Never silently choose by price or claim providers are interchangeable.
12. **Multi-provider:** execute bounded independent reads and return a container of intact provider results plus per-provider status; never coalesce vendor metrics.
13. **Incompatible metrics:** each observation carries provider metric ID, semantic family, value, unit/scale, definition/version, and an optional comparison key. Missing or different comparison keys prohibit numeric equivalence.
14. **Cost:** classify calls, preflight when supported, cap calls/pages/rows/concurrency, require explicit paid-call authorization above configured budgets, expose actual provider units, and honor provider retention rules in replay.
15. **Testing:** one provider-neutral conformance suite plus adapter fixtures, request/response goldens, adversarial security tests, pagination/task/retry/cost tests, and opt-in live smoke tests.
16. **Drift:** immutable contract snapshots, scheduled documentation/schema checks, credential-gated low-row probes, API-version recording, deduplicated issues, and deprecation windows.
17. **Third-party authoring:** scaffold a manifest v2 and fixture pack, implement declarative operations/mappings, run conformance, sign the package, and validate against an exact invocation allowlist.
18. **Kujo Agent Projects:** expose a small capability catalog and normalized evidence tool; agents select semantic intent while SearchBridge records the resolved provider.
19. **MCP:** publish four narrow tools—catalog, fetch, query, and separately gated submit—rather than one tool per vendor endpoint.
20. **WebOps:** Dispatch workflows compose SearchBridge reads with SiteProbe and ContentGraph artifacts; SearchBridge does not interpret or recommend.
21. **Distribution:** provider-specific audiences and channel confidence are mapped in `10-distribution-opportunities.md`; no partnership is assumed.
22. **Smallest proof:** registry-driven `fetch`, metric provenance, multi-provider container, and two adapters with different protocols: DataForSEO plus the external Plausible reference adapter.
23. **Batch 1:** DataForSEO, Semrush, SerpApi, Cloudflare Analytics, Plausible.
24. **Later:** Moz, Similarweb, Matomo, Google Ads Keyword Planner, Majestic/Sistrix/AccuRanker; Google Trends after general availability.
25. **Never add:** provider-native recommendation scores as universal truth, mutation-heavy marketing/platform APIs in the read registry, arbitrary unsigned code, arbitrary credential-bearing URLs, silent paid calls, or lossy cross-provider metric merging.

## Evidence standard

Repository statements are based on source inspection at commit `HEAD` on 2026-09-02. External facts use primary documentation where available. Prices, entitlements, redistribution rights, and limits are time-sensitive; the provider matrix records `unknown` instead of guessing. Legal notes are implementation stop conditions, not legal advice.
