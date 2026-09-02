# Plausible reference adapter

This signed, declarative adapter demonstrates `searchbridge-adapter/v2` with Plausible Stats API v2 `analytics`. It is read-only and uses the exact endpoint `https://plausible.io/api/v2/query`. The package fixture is synthetic.

Load the public key from `trust-key.pem` into an environment variable, then run `adapter-run` with the manifest, detached signature, exact capability, endpoint and credential allowlists. Fixture mode reads no credential and performs no network call. Live mode reads `SEARCHBRIDGE_PLAUSIBLE_TOKEN` only after the signature, package digests and allowlists validate.

The current generic package runner preserves normalized fixture rows. Query templating, offset paging and live request-body binding are restricted to the declared operation fields; use the built-in `fetch` interface for normal provider routing.
