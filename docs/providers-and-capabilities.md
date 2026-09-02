# Providers and capabilities

The `providers`, `capabilities`, and compact `agent-catalog` commands are projections of the canonical adapter v2 registry. Discovery reads static metadata only; it never loads credentials or contacts providers.

Batch 1 adds DataForSEO (`serp.results`, `rank.tracking`, `keyword.data`), SerpApi (`serp.results`), Cloudflare (`edge.analytics`), and selected Semrush domain/rank/keyword/backlink/traffic evidence. Plausible supplies `analytics` through the signed external reference package. Existing Google, Bing, Ahrefs, CrUX, PageSpeed and IndexNow capabilities remain compatible.

Credentials stay in environment variables: `SEARCHBRIDGE_DATAFORSEO_LOGIN` and `SEARCHBRIDGE_DATAFORSEO_PASSWORD`, `SEARCHBRIDGE_SERPAPI_KEY`, `SEARCHBRIDGE_CLOUDFLARE_TOKEN` plus `SEARCHBRIDGE_CLOUDFLARE_ZONE_ID`, and `SEARCHBRIDGE_SEMRUSH_KEY`. Paid or unknown live reads require `--allow-paid`, `--max-calls`, and `--max-provider-units`. Semrush live execution remains disabled until its commercial and redistribution review is recorded; synthetic fixture execution is available.

SearchBridge exposes only reviewed operations, not entire vendor catalogs. Cloudflare uses one fixed GraphQL operation with variables and reports edge requests rather than visits. DataForSEO support is limited to Google organic SERP live/standard and keyword search-volume evidence. SerpApi support is limited to Google organic results. Provider metrics remain provider-qualified observations.
