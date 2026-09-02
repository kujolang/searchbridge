# Capability taxonomy

Capability IDs answer “what evidence is needed?” Existing IDs remain stable. New vendor endpoint names are never capability IDs.

## Canonical set

| ID | Evidence and minimum normalized fields | Class | Providers | Overlap rule |
| --- | --- | --- | --- | --- |
| `search.performance` | verified property query/page/date dimensions; clicks, impressions, CTR, average position | read | GSC, Bing Webmaster | First-party search-engine performance only. Do not mix with rank trackers. |
| `analytics` | observed site/app dimensions plus sessions/visits, views, users/visitors, events/conversions where requested; metric observations retain native definition | read | GA4, Plausible, Matomo, Fathom | First-party analytics. Metrics are comparable only with an explicit comparison key. |
| `url.inspection` | URL, verdict/coverage, crawl/indexing state, crawl time, declared/provider canonical | read | GSC | Per-provider inspection; no inferred bulk coverage. |
| `page.performance` | URL, device strategy, lab categories/audits, optional provider field snapshot | read | PSI, Lighthouse-capable services | Lab evidence, not user population measurements. |
| `field.performance` | URL/origin, form factor, metric histograms/percentiles, collection period | read | CrUX | Population field evidence, separate from lab. |
| `backlinks` | source/target URL, anchor, first/last seen, follow state; optional source metrics | read | Ahrefs, Bing, Semrush, Moz, DataForSEO, Majestic | A link observation is comparable; proprietary scores are not. |
| `keyword.data` | keyword, locale/language, observation date; typed metric observations for volume, CPC, competition/difficulty, intent, trend, related term | read | Ahrefs, Semrush, DataForSEO, Moz, Google Ads/Trends | All values are estimates unless provider defines otherwise; source metric identity mandatory. |
| `index.submission` | provider receipt, URLs, accepted/received status; `indexed=false` unless later inspection proves it | write | IndexNow, Bing | Separate mutation path; `--act --yes` every time. |
| `rank.tracking` | tracked keyword, target/domain/URL, engine, locale/device, observed time, rank, result URL, tags/project provenance | read | Semrush Projects, DataForSEO Labs, AccuRanker, SE Ranking, SearchAtlas subset | Account/project time series, distinct from one-off SERP and search-console average position. |
| `serp.results` | query, engine, locale/device, captured time; ordered result type/rank/URL/title/snippet and feature metadata | read | SerpApi, DataForSEO | Snapshot of a result page, not rank history or traffic performance. |
| `domain.visibility` | domain/subdomain/path, locale/database, date; source-specific visibility/authority/share metric observations | read | Semrush, Moz, Similarweb, Sistrix, Ahrefs | Every metric carries source ID/definition/scale/comparison key. No universal authority score. |
| `traffic.estimate` | domain, geography/device/channel, period; estimated visits/users/views/engagement metric observations | read | Similarweb, Semrush Trends, DataForSEO Labs | Third-party modeled estimates; never merge with `analytics`. |
| `edge.analytics` | zone/host/path/time dimensions; requests, bytes, cached/uncached, status/security/product measures | read | Cloudflare Analytics | Network requests are not visits/users/conversions. |
| `crawl.data` | provider crawl/run ID, URL, fetched time/status, issue or measured technical fact, severity/source rule where supplied | read | DataForSEO On-Page, Semrush Site Audit, SearchAtlas subset | Provider crawl evidence only. Local crawl remains SiteProbe. Vendor recommendations remain source annotations. |

## Shared provenance contract

Every result identifies provider, retrieval time, adapter version, capability contract version, request fingerprint, mode, and applied budgets. Every proprietary or definition-sensitive value uses a metric observation:

```json
{
  "metric_id": "moz.domain_authority",
  "semantic_family": "domain_authority_signal",
  "value": 71,
  "unit": "score",
  "scale": {"min": 0, "max": 100, "direction": "higher"},
  "definition_version": "provider-current-2026-09-02",
  "comparison_key": "moz.domain_authority/provider-current-2026-09-02",
  "estimated": true
}
```

Two observations may be compared numerically only when `comparison_key` matches. Semantic families support discovery and grouping, not arithmetic equivalence. Unknown definitions use `comparison_key: null`.

## Deliberate exclusions

- `keyword.volume`, `keyword.difficulty`, `keyword.intent`, and `keyword.related` remain query facets/metric families under `keyword.data`; separate capabilities would multiply tools without changing execution boundaries.
- `domain.authority` is not a capability because vendor authority scores are proprietary and incompatible; use `domain.visibility` metric observations.
- `link.intersections` is a backlinks query mode returning link observations grouped by compared targets.
- `competitor.visibility` is `domain.visibility` with multiple explicit targets.
- `web.analytics` is not added; the stable `analytics` ID already owns first-party observed analytics.
- `site.audit` is not a capability because it implies provider interpretation. Raw provider crawl findings fit `crawl.data`.
- `index.coverage` is not added until a stable API exposes bulk coverage evidence. Repeated URL inspection must remain explicit and bounded.
- Content scores, AI recommendations, generated keywords/content, ad forecasts, dashboards and campaign/listing mutations are outside core.

## Query shape versus capability

Filters such as locale, engine, date range, dimensions, metrics, target scope, device, and provider are typed query fields. They do not create new capabilities. Provider capability metadata declares which query fields and metric families are supported so unsupported intent fails before transport.
