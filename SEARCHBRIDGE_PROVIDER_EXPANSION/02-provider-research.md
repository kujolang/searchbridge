# Provider research

Research date: 2026-09-02. Links are first-party unless explicitly marked. Commercial terms change; verify entitlement and redistribution rights before live implementation. “Unknown” means no authoritative public statement was found during this audit. Adoption and distribution assessments are audit inferences from product scope, developer surfaces and ecosystem visibility; they are not measured market-share claims.

## Core candidates

### Semrush

- Contract: SEO API v3/v4 exposes domain, keyword, backlink and project data; v3 includes CSV-heavy reports and v4 adds JSON endpoints. Authentication uses versioned API keys, with OAuth for some project APIs.
- Capabilities: `rank.tracking`, `domain.visibility`, `backlinks`, `keyword.data`; limited `crawl.data` from project Site Audit only.
- Limits/cost: 10 requests/second and 10 concurrent requests per account; Standard API consumes endpoint/line-dependent units. Historical rows can cost more. Empty-result charging varies by API.
- Stability/freshness: active v3/v4 release notes; data freshness varies by report. Historical availability is endpoint/subscription-specific.
- Terms: API data may not be cached beyond one month without written consent; external-user products should confirm the applicable Semrush terms/sales permission.
- Fit: built-in because parsing, units, retention metadata and broad adoption need maintained core coverage. Keep project mutations out.
- Sources: [API overview](https://developer.semrush.com/api/v3/introduction/semrush-api-overview/), [access](https://developer.semrush.com/api/v4/get-started/api-access/), [usage restrictions](https://developer.semrush.com/api/v4/introduction/api-usage-restrictions/), [unit accounting](https://developer.semrush.com/api/v3/get-started/api-units-balance/).

### Moz Links API

- Contract: Links API v2 exposes URL metrics, linking roots/pages, anchor text and link intersections at `lsapi.seomoz.com`; current public documentation was not reliably retrievable in this audit.
- Auth/cost/limits: access ID/secret or current account credentials and plan-specific row quotas have existed, but exact 2026 details are **unknown pending owner-portal verification**. Do not encode remembered values.
- Capabilities: `backlinks` and source-specific authority observations under `domain.visibility`; never map Domain Authority/Page Authority to generic “authority”.
- Fit: Tier 2 external adapter first. Promote only after public contract, fixture entitlement, and redistribution terms are verified.
- Source: [Moz API product entry](https://moz.com/products/api) (availability must be rechecked); archived official setup material is insufficient for release truth.

### DataForSEO

- Contract: REST/JSON v3 spans SERP, keyword data, backlinks, labs/on-page and business data. Many families offer synchronous Live and asynchronous Standard task POST/status/GET flows; callbacks/postbacks exist.
- Auth: HTTP Basic with API login and generated API password in `Authorization`; credentials cannot be query parameters.
- Limits/cost: endpoint-specific rate headers; SERP documentation states up to 2,000 POST/GET calls per minute with at most 100 tasks per POST. Live costs more than Standard; depth and priority change cost. User Data exposes account prices/spend, while sandbox supports fixtures.
- History/freshness: task JSON commonly retained 30 days, HTML 7 days, Live results not stored by DataForSEO; varies by API.
- Capabilities: `serp.results`, `keyword.data`, `backlinks`, `rank.tracking`, `domain.visibility`, `crawl.data`.
- Fit: built-in Tier 1. Its task state machine and cost metadata are an essential architecture proof. On-Page results are evidence only; do not import vendor recommendations as SearchBridge judgments.
- Sources: [v3 introduction and rate headers](https://docs.dataforseo.com/v3/), [authentication](https://docs.dataforseo.com/v3/auth/), [SERP methods and limits](https://docs.dataforseo.com/v3/serp/overview/), [usage/pricing discovery](https://docs.dataforseo.com/v3/appendix-user-data/).

### Similarweb

- Contract: REST API v5 and batch APIs provide estimated website traffic/engagement, audience and channel data; v4/v5 endpoints use JSON and many support limit/offset. Batch reports are asynchronous and may return expiring download URLs. Webhooks can announce daily/monthly data availability.
- Auth: activated API key in a header; account administrators allocate per-user credits.
- Cost: data credits; the traffic/engagement endpoint documents one credit per metric/result, up to eight when all listed metrics are requested. Batch validate can estimate credits before execution; free discovery endpoints report credits and entitlement.
- Availability/history: endpoint, country, granularity and history depend on contract. Premium API access/account manager involvement is required.
- Capabilities: `traffic.estimate`, `domain.visibility`.
- Fit: high-value Tier 2 built-in after commercial/redistribution review. Keep its estimates distinct from first-party `analytics`.
- Sources: [authentication](https://docs.similarweb.com/api-v5/getting-started/authentication), [traffic and engagement](https://docs.similarweb.com/api-v5/similarweb-api/website-analysis-api/website-performance/traffic-and-engagement), [credit model](https://developers.similarweb.com/docs/data-credits-unpublished-whats-new-in-v40), [batch validation/status](https://developers.similarweb.com/docs/report-endpoints), [webhooks](https://developers.similarweb.com/docs/how-to-subscribe-to-webhook-notifications).

### SerpApi

- Contract: structured JSON for Google and other search engines, with organic results, rich features and pagination; account endpoint reports monthly usage/throughput.
- Auth: API key query parameter. This requires cache-key redaction and strict error/telemetry tests because the credential is in the URL passed to transport.
- Cost/limits: plans are per monthly search count with hourly throughput; current public pricing includes a limited free plan. One search is charged independent of result count according to the pricing page. Exact plan prices are deliberately not encoded in runtime metadata.
- Capabilities: `serp.results` only initially. Related questions/searches may be source fields, not `keyword.data` until definitions are stable.
- Fit: built-in Tier 1 because of demand, protocol stability and credential-in-query sensitivity.
- Sources: [Google Search API documentation](https://serpapi.com/search-api), [account usage API](https://serpapi.com/account-api), [pricing](https://serpapi.com/pricing).

### Cloudflare Analytics

- Contract: a single GraphQL POST endpoint exposes over 70 zone/account datasets for aggregated traffic and product analytics.
- Auth: scoped API token is preferred; global keys are supported but must not be recommended. Tokens require Analytics Read on exact resources.
- Limits: default 300 GraphQL queries per five minutes per user plus global/node limits. Dataset settings define history, interval, field and row ceilings; plan availability varies.
- Capabilities: `edge.analytics`, not `analytics`. HTTP requests/bytes at the edge are not sessions, users, page views, or conversions. Web Analytics-specific dataset availability must be discovered per account.
- Cost: provider plan/quota; GraphQL results are not billing truth.
- Fit: built-in Tier 1 because GraphQL query construction and least-privilege resource scoping need core review.
- Sources: [GraphQL overview](https://developers.cloudflare.com/analytics/graphql-api/), [authentication](https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/), [limits](https://developers.cloudflare.com/analytics/graphql-api/limits/), [errors](https://developers.cloudflare.com/analytics/graphql-api/errors/).

### Plausible

- Contract: read-only Stats API v2 uses `POST /api/v2/query` and returns aggregated metrics for dates, dimensions and filters. Offset pagination defaults to 10,000 rows; total rows are optional.
- Auth: team-scoped bearer Stats API key.
- Limits/cost: default 600 requests/hour; Stats API is a Business feature. Hosted endpoint is stable; self-hosted compatibility/URL is **unknown and must be fixture-tested separately**.
- Semantics: values may vary slightly with metric combinations because different aggregation tables/heuristics can be selected; imported analytics may be omitted for unsupported dimension/filter combinations and response metadata explains this.
- Capabilities: `analytics`.
- Fit: Tier 1 signed reference adapter. It validates external adapter authoring while providing agency/site-operator distribution.
- Sources: [Stats API v2](https://plausible.io/docs/stats-api), [data access boundary](https://plausible.io/docs/data-access).

### Matomo

- Contract: broad Reporting HTTP API returns JSON/CSV/XML for site/date/period and supports `filter_limit`; report metadata is discoverable. The same API surface also includes management methods.
- Auth: `token_auth`; official guidance recommends POST-only tokens and sending the token in a POST body. Optional OAuth plugin exists.
- Limits/cost: self-hosted limits are operator-defined; Cloud plan limits are contract-dependent. Default report rows are commonly 100, while `-1` means unbounded and must never be passed by SearchBridge.
- Capabilities: `analytics`; selected read-only crawl/search-referrer reports may be added only if they fit an existing capability.
- Fit: Tier 2 external adapter. User-controlled origins require an exact per-invocation HTTPS endpoint allowlist and credential binding. Never expose management or tracking methods.
- Sources: [Reporting API](https://developer.matomo.org/api-reference/reporting-api), [authentication guidance](https://developer.matomo.org/guides/reporting-api), [query guide](https://developer.matomo.org/guides/querying-the-reporting-api).

### SearchAtlas

- Contract: OpenAPI 1.0.0 documents multiple service origins and API-key headers, including projects, content audits, rank/LLM visibility, content generation and indexing workflows.
- Cost/limits/history/redistribution: public authoritative details are **unknown**.
- Fit: do not add in the first two batches. Most documented surface is workflow/mutation/content-product functionality outside the gateway. A future external adapter may expose read-only rank/visibility evidence only after stable endpoint and licensing review.
- Source: [official API documentation](https://docs.searchatlas.com/).

## Additional candidates

| Provider | Decision | Reason and authoritative status |
| --- | --- | --- |
| Google Trends API | Watchlist | Strong `keyword.data` trend evidence, but the official API remains limited alpha with a five-year rolling window. Add only after general availability and stable auth/quotas. [Official alpha](https://developers.google.com/search/apis/trends). |
| Google Ads Keyword Planner | Tier 2 built-in | High-quality keyword ideas/historical volume; requires OAuth, developer token and customer ID, and planning methods are limited to 1 QPS per customer. Keep ad/campaign mutations out. [Overview](https://developers.google.com/google-ads/api/docs/keyword-planning/overview), [quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas), [ideas](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-keyword-ideas). |
| Majestic | Tier 3 external | Useful backlinks and vendor trust metrics; verify current auth, plans, row limits and redistribution in the owner portal before implementation. No generic authority field. |
| Sistrix | Tier 3 external | Valuable European visibility/keyword audience; contract and credit terms require current first-party verification. |
| AccuRanker / SE Ranking / BrightLocal | Tier 3 external | Rank/local rank evidence fits `rank.tracking`; narrower audience and account/project coupling make external adapters preferable. Mutations excluded. |
| Fathom | Tier 3 external | First-party privacy analytics fits `analytics`; narrower distribution than Plausible. Verify API plan/rate policy. |
| Umami | Tier 3 external | Self-hostable analytics is attractive, but version/origin variance creates support burden. Exact endpoint allowlists required. |
| PostHog | Do not add now | Broad product analytics overlaps only partly with web intelligence; add only if a concrete website-evidence contract emerges. |
| Vercel Web Analytics | Do not add now | No stable, public, general-purpose reporting API was verified; do not scrape dashboards. |
| Generic Bing Web Search API | Do not add | General web search content retrieval is not rank/SERP measurement and would broaden scope into a generic search API gateway. |

## Licensing and retention gate

For every provider, implementation must record: documentation URL and checked date, contract version, cache maximum age if specified, whether raw rows may be redistributed, whether customer-facing display requires permission/attribution, and whether fixtures may be committed. Unknown answers block public live-adapter release but do not block synthetic fixture development. Raw provider responses must never be committed without explicit license confirmation.
