# Provider priorities

## Scoring model

Scores are 1 (weak) to 5 (strong). Higher is always better, so overlap, difficulty, verification cost and rate-limit pressure are scored as “low overlap”, “easy”, “cheap to verify”, and “low pressure”. Weighted total is out of 5.

| Criterion | Weight |
| --- | ---: |
| User demand | 15% |
| Developer/agency adoption | 10% |
| Unique capability gain | 10% |
| Low overlap with current providers | 5% |
| API quality/stability | 10% |
| Implementation ease | 8% |
| Testability | 8% |
| Fixture feasibility | 6% |
| Low verification cost | 5% |
| Low rate-limit pressure | 4% |
| Strategic distribution value | 9% |
| SearchBridge architectural fit | 10% |

The exact input scores and dispositions are in `PROVIDER_MATRIX.json`. Scores are prioritization judgments, not market facts. Tier gates override totals: Similarweb, for example, scores highly but remains Tier 2 until enterprise entitlement and redistribution review are complete.

## Tiers

### Tier 1 — first batch

| Provider | Total | Form | Why now |
| --- | ---: | --- | --- |
| SerpApi | 4.79 | built-in | Clean `serp.results` proof and strong developer/agent relevance. |
| Cloudflare Analytics | 4.67 | built-in | Unique first-party edge evidence and GraphQL/resource-scope proof. |
| DataForSEO | 4.51 | built-in | Broadest capability gain and best proof of task, pagination and cost controls. |
| Plausible | 4.26 | signed reference adapter | Strong fit, simple read API and decisive proof that external adapters are real. |
| Semrush | 4.21 | built-in | High agency adoption/distribution; validates CSV, units, retention and rank/domain contracts. |

Order the work by architecture, not score: registry/conformance → Plausible external proof → DataForSEO live/task shape → SerpApi → Cloudflare → Semrush CSV/unit/retention.

### Tier 2 — after batch 1 gates

- **Moz:** external first; backlinks/authority audience is valuable, but current contract, entitlement and redistribution details need owner-portal verification.
- **Similarweb:** built-in after legal/commercial approval; excellent `traffic.estimate`, but enterprise access and credits make verification costly.
- **Matomo:** external; self-hosted origin and version diversity are exactly what strict external policies should cover.
- **Google Ads Keyword Planner:** built-in; authoritative keyword ideas/volume but OAuth/developer-token/customer-ID complexity and 1-QPS planning limit raise maintenance cost.

### Tier 3 — community or demand-led

Majestic, Sistrix, AccuRanker, SE Ranking, BrightLocal, Fathom and Umami. These fit existing capabilities but have narrower distribution, account/project coupling, self-host variability, or unverified public terms. Start as external adapters and promote only when usage and drift maintenance justify it.

### Do not add now

- SearchAtlas as a whole: too much mutation/content/workflow surface; accept only a future read-only rank/visibility subset.
- PostHog: product analytics breadth exceeds the web-intelligence boundary.
- Vercel Web Analytics: no stable general reporting API was verified.
- Google Trends: limited alpha, not generally available.
- Generic Bing Web Search and arbitrary search/scraping APIs: generic content search is outside measurement evidence.

## Built-in criteria

An adapter is built-in only when at least three are true: fills a core capability gap; broad adoption; stable public contract; protocol or credential sensitivity needs core review; distribution is material; live drift fixtures can be maintained; external DSL cannot express it safely. Built-in does not mean automatic enablement or bundled credentials.

External is preferred for narrow vendors, self-hosted endpoints, fast-moving contracts, project-coupled products, and community-maintained coverage. Both forms run through the same registry and conformance suite.

## Subsequent batches

- Batch 2: Moz external, Similarweb built-in, Matomo external, Google Ads Keyword Planner built-in.
- Batch 3: Majestic/Sistrix/AccuRanker reference adapters based on demand; Fathom/Umami community adapters.
- Watchlist: Google Trends GA, SearchAtlas evidence-only contract, provider webhooks used only for drift/freshness notification (never as an implicit mutation surface).
