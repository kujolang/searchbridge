# Providers, capabilities, and support tiers

The `providers`, `capabilities`, `doctor`, and compact `agent-catalog` commands are projections of the canonical adapter v2 registry. Discovery reads static metadata only; it never loads credentials or contacts providers. Every surface reports one of four support tiers: `stable-live`, `fixture-only`, `external-reference`, or `disabled`.

The v1 stable-live set is Google Search Console, Google Analytics 4, PageSpeed Insights, and CrUX. Cloudflare, IndexNow, Bing Webmaster, Ahrefs, DataForSEO, and SerpApi remain fixture-only until their stated external qualification is complete. Plausible is a signed external reference package; Semrush is disabled. See the [support matrix](support-matrix.md), [provider setup guide](provider-setup.md), and [policy ledger](provider-policy-ledger.json).

Automatic live routing considers only stable-live providers. Direct live execution of a fixture-only or external provider additionally requires `--allow-unverified-live`; paid or unknown live reads still require `--allow-paid`, `--max-calls`, and `--max-provider-units`. Semrush cannot run live. Fixture execution remains available for every built-in provider without network access or credentials.

SearchBridge exposes only reviewed operations, not entire vendor catalogs. Cloudflare uses one fixed GraphQL operation with variables and reports edge requests rather than visits. DataForSEO support is limited to Google organic SERP live/standard and keyword search-volume evidence. SerpApi support is limited to Google organic results. Provider metrics remain provider-qualified observations.
