# Provider setup and live qualification

Use placeholder values only in committed configuration. Provider credentials belong in the local environment, an approved secret manager, or the GitHub `provider-contract-tests` environment. Never save tokens, keys, service-account files, request headers, property identifiers, or credential-bearing URLs in logs or artifacts.

## Google Search Console and GA4

Local agents may receive a short-lived access token through `SEARCHBRIDGE_GSC_TOKEN` and `SEARCHBRIDGE_GA4_TOKEN`. Grant the calling identity read access only to the selected test properties.

GitHub Actions uses Workload Identity Federation and the pinned `google-github-actions/auth` action. Configure non-secret environment variables `GOOGLE_WORKLOAD_IDENTITY_PROVIDER` and `GOOGLE_SERVICE_ACCOUNT`; scope the trust condition to this repository and the `provider-contract-tests` environment. The workflow requests `id-token: write` only in the live-contract job, emits a 15-minute access token, creates no credential file, and deletes any `gha-creds-*.json` file in an `always()` cleanup step. Do not substitute a committed service-account key or persisted refresh token.

```bash
export SEARCHBRIDGE_GSC_TOKEN='<short-lived-token>'
export SEARCHBRIDGE_GSC_PROPERTY='<verified-property>'
./searchbridge search-performance --property "$SEARCHBRIDGE_GSC_PROPERTY" \
  --start-date 2026-09-01 --end-date 2026-09-02 --page-size 10 \
  --max-pages 2 --max-total-rows 20 --max-calls 2

export SEARCHBRIDGE_GA4_TOKEN='<short-lived-token>'
./searchbridge analytics --property '<property-number>' --start-date 2026-09-01 \
  --end-date 2026-09-02 --page-size 10 --max-pages 2 \
  --max-total-rows 20 --max-calls 2
```

Revoke property access or the workload-identity binding to revoke CI access. An expired or invalid token produces a redacted provider-scoped failure without disabling unrelated capabilities.

## PageSpeed Insights and Chrome UX Report

PageSpeed accepts a keyless bounded request; use a restricted key only for approved repeated automation. CrUX requires a key restricted to the Chrome UX Report API. A valid CrUX 404/no-record response normalizes to an empty row set.

```bash
./searchbridge pagespeed --url 'https://example.invalid/' --strategy mobile --max-calls 1
export SEARCHBRIDGE_CRUX_KEY='<restricted-api-key>'
./searchbridge crux --url 'https://example.invalid/' --form-factor PHONE --max-calls 1
```

## Cloudflare

Create a separate API token with the smallest Analytics Read permission, zone restriction, IP restriction where practical, and a finite lifetime. Set `SEARCHBRIDGE_CLOUDFLARE_TOKEN` and `SEARCHBRIDGE_CLOUDFLARE_ZONE_ID`. Cloudflare remains `fixture-only` until `httpRequests1dGroups` and every requested field succeed on the existing plan. Do not upgrade the plan.

Direct qualification also requires the explicit non-stable tier opt-in:

```bash
./searchbridge fetch --capability edge.analytics --provider cloudflare \
  --start-date 2026-09-01 --end-date 2026-09-02 \
  --max-calls 1 --max-pages 1 --max-total-rows 10 --allow-unverified-live
```

## IndexNow

Host an IndexNow key file on an operator-owned host. A real submission is a write and is never scheduled. It requires owner approval plus all confirmation flags on that invocation:

```bash
export SEARCHBRIDGE_INDEXNOW_KEY='<same-host-key>'
./searchbridge submit --provider indexnow --url 'https://owned.example/path' \
  --key-location 'https://owned.example/key-file.txt' \
  --capability index.submission --allow-unverified-live --max-calls 1 --act --yes
```

The receipt proves only received/accepted status; it never claims indexing.

## Qualification evidence

The scheduled read-only workflow emits `searchbridge.live-contract-evidence/v1` JSONL without properties, URLs, rows, headers, tokens, raw response bodies, or credential-bearing errors. Run the same matrix locally only with explicitly supplied test access:

```bash
export SEARCHBRIDGE_SOURCE_COMMIT="$(git rev-parse HEAD)"
"${KUJO_BIN:-../kujo/target/release/kujo}" run scripts/live_contract.kujo -- \
  google-search-console search-analytics success
"${KUJO_BIN:-../kujo/target/release/kujo}" run scripts/provider_readiness_gate.kujo -- \
  --require-live live-contract-evidence.jsonl
```

Rotate or revoke a credential immediately after suspected exposure. Do not upload diagnostic environments or raw transport captures.
