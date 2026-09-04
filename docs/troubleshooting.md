# Troubleshooting

Start with `searchbridge doctor --deterministic` and inspect the affected
provider's `support_tier`, `credential_ready`, and `missing_environment`
fields. Discovery never contacts a provider or prints credential values.

## Missing or expired credentials

Set only the environment variables named by `missing_environment`, then rerun a
bounded read. Google bearer tokens are intentionally short-lived; refresh them
through the approved identity flow rather than storing a refresh token or
service-account file. A redacted provider-scoped failure must not disable other
capabilities.

## Provider unavailable or rate limited

Keep `--max-calls`, `--retries`, `--timeout`, `--max-pages`, and
`--max-total-rows` bounded. SearchBridge honors capped numeric `Retry-After`
values and returns partial multi-provider results. Do not raise traffic to
manufacture a 429. Use an approved fresh encrypted replay for temporary read
continuity, never for submissions.

## Fixture succeeds but live routing does not

Fixture coverage exists for every provider. Automatic live routing admits only
`stable-live`. A direct fixture-only or external provider requires
`--allow-unverified-live`, and metered providers additionally require the paid
preflight flags. Semrush remains disabled.

## Schema or adapter rejection

Stop live consumption and retain only sanitized response-shape evidence. Check
the 1.x compatibility policy and adapter version bounds, regenerate types and
goldens through the repository scripts, and run `bash scripts/validate.sh`.
Never bypass signature, endpoint, credential, or capability allowlists.

## Submission refused

Every invocation must name `--capability index.submission --act --yes`; a
fixture-only submission provider also requires `--allow-unverified-live` on the
real path. URLs must be HTTP(S), share one host, contain no user-info, and stay
within the 1,000 URL bound. Acceptance never proves indexing.

## Rollback

Select the previous checksum-verified immutable bundle, restore its compatible
adapter trust set and configuration, then run `version`, `doctor`, and an
offline fixture. Preserve cache state from before any one-way migration; do not
edit replay or task receipts to force compatibility.
