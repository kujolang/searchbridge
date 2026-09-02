# Plausible reference adapter

This signed, declarative adapter demonstrates `searchbridge-adapter/v2` with Plausible Stats API v2 `analytics`. It is read-only and uses the exact endpoint `https://plausible.io/api/v2/query`. The package fixture is synthetic.

Load the public key from `trust-key.pem` into an environment variable, then run `adapter-run` with the manifest, detached signature, exact capability, endpoint and credential allowlists. Fixture mode reads no credential and performs no network call. Live mode reads `SEARCHBRIDGE_PLAUSIBLE_TOKEN` only after the signature, package digests and allowlists validate.

The generic package runner materializes only declared, typed query slots into a
fixed request-body template, normalizes only declared row mappings, and applies
the shared call, page, row, response, output, retention, and timeout bounds.
The Plausible operation uses bounded offset pagination. It can be invoked by
`adapter-run` or by semantic `fetch --provider plausible`; both paths verify the
signature, package digests, and invocation allowlists before credential access.
