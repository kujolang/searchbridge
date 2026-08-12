# Provider research and V1 disposition

Research refreshed 2026-08-12 from primary provider documentation.

| Provider | Official contract | V1 disposition |
| --- | --- | --- |
| Google Search Console | [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) uses `POST /webmasters/v3/sites/{siteUrl}/searchAnalytics/query`, read-only OAuth scope, date range, dimensions, and bounded rows. | Implemented live REST + fixture for search performance; URL inspection uses the official inspection endpoint contract. |
| Google Analytics 4 | [Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1/rest) exposes `POST /v1beta/{property}:runReport`. | Implemented live REST + fixture with explicit dimensions, metrics, and date range. |
| PageSpeed Insights | [API v5](https://developers.google.com/speed/docs/insights/v5/get-started) accepts a URL and optional key. | Implemented live GET + fixture. |
| Chrome UX Report | [CrUX API](https://developer.chrome.com/docs/crux/api) requires a Google Cloud API key. | Implemented live POST + fixture; kept distinct from lab PageSpeed evidence. |
| IndexNow | [Protocol documentation](https://www.indexnow.org/documentation) defines single/batch URL submissions, key ownership, and 200/202 receipt semantics. | Implemented explicit ACT batch POST + fixture; receipt never claims indexing. |
| Bing Webmaster | [API documentation](https://learn.microsoft.com/en-us/bingwebmaster/) supports rank/traffic, links, keywords, crawl data, URL and sitemap submission; OAuth and API key access exist. | Implemented bounded JSON REST adapters and fixtures with bearer-token preference and API-key fallback; live endpoint behavior remains provider-account dependent. |
| Ahrefs API v3 | [API guide](https://docs.ahrefs.com/en/ahrefs-connect/docs/api-guide) and [backlinks endpoint](https://docs.ahrefs.com/en/api/reference/site-explorer/get-all-backlinks) expose cost-bearing Site Explorer and keyword data. | Implemented optional, row-bounded live REST + fixture; doctor reports cost warning. |
| Google Indexing API | [Official scope](https://developers.google.com/search/apis/indexing-api/v3/using-api) is only job postings and livestream event pages. | Deferred as a general adapter; no command implies unsupported general submission. |

Fixture support proves normalization and boundary behavior, not provider
authorization or production availability. Live calls are opt-in and redact
provider error bodies to avoid accidental credential or private-property data
leakage.
