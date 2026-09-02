# Adapter authoring and trust

SearchBridge has one provider contract: `searchbridge-adapter/v2`. Built-ins and signed external packages declare the same capability, operation, endpoint, format, pagination, normalization, cost and retention metadata. Core owns I/O, retries, credentials, cache, budgets, telemetry and output.

External packages are declarative and read-only. They cannot execute Kujo, native code, shell, filesystem operations, raw GraphQL or mutations. Each request uses a fixed HTTPS endpoint template, denied redirects, schema-enumerated query fields and an environment-variable credential bound to that exact endpoint. Endpoint, capability and credential allowlists are required again at invocation.

Requests use recursive `body_template` objects and sorted `query_template`
objects whose leaves may reference allowlisted `query.FIELD` slots. The only transform is `csv-list`; arbitrary
expressions are not supported. Normalization is an ordered mapping of JSON
pointers or safe query fields to row fields with explicit scalar coercions.
JSON, GraphQL JSON, and bounded CSV parsing stay inside the shared transport.
Offset/list-window pagination declares body slots for offset and limit;
page-size declares page and limit slots; cursor declares a request slot and
response pointer; asynchronous tasks declare an exact task-result endpoint and
bounded status pointers. Installed
packages participate in semantic fetch only through an explicit provider ID;
external `auto` and `all` discovery remain disabled until a trusted installation
registry exists.

The manifest must use `searchbridge-canonical-json/v1` and satisfy
`schemas/adapter-manifest-v2.schema.json`. This is intentionally not labeled RFC
8785 JCS: it recursively sorts object keys, removes insignificant whitespace,
preserves array order, and delegates scalar/string serialization to the pinned
Kujo runtime. Its detached RSA-SHA256 signature covers those exact UTF-8 bytes.
The manifest binds every auxiliary file by SHA-256, so fixture or mapping
tampering fails before credentials are read. Trust uses the publisher public-key
fingerprint; the display name is not an identity claim.

`--adapter-key-env` accepts a comma-separated set of public-key environment
variables during a planned rotation. The manifest fingerprint must match one of
them. `SEARCHBRIDGE_ADAPTER_REVOKED_FINGERPRINTS` is a comma-separated emergency
denylist applied before signature verification; a revoked publisher key fails
closed even if it remains in the trust set. Rotate by adding the new public key,
re-signing packages with the new fingerprint, then removing or revoking the old
fingerprint after the overlap window.

Adapters declare an inclusive `minimum_searchbridge_version` and may declare
an inclusive `maximum_searchbridge_version`. The runtime accepts only valid
SemVer ranges within its current major version. A deprecated operation remains
loadable only when its metadata names a replacement and a future
`removal_version`; it fails closed at that version. Breaking capability or row
changes require a new contract version, while additive optional fields remain
compatible within the major series. The cases in
`fixtures/adapter-version-cases.json` are the executable migration boundary.

The Plausible package under `adapters/plausible/` is the reference. Its committed key is a package verification key, not a provider credential. Load that public key into the environment variable named by `--adapter-key-env`; never place API tokens in manifests or configuration.

## v1 migration

Legacy manifests without a `contract` field continue through the v1 loader for
the 0.4 release series. To migrate, replace the single request table with
capability declarations and read operations, bind credentials to exact endpoint
templates, declare cost/retention/reliability and a compatible runtime range,
move fixtures into package files with SHA-256 digests, emit canonical JSON, and
sign the complete manifest. External writes remain unsupported in both
versions. Removal of the v1 loader requires a major release and one full minor
release of deprecation notice.
