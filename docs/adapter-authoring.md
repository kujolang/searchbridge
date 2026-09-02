# Adapter authoring and trust

SearchBridge has one provider contract: `searchbridge-adapter/v2`. Built-ins and signed external packages declare the same capability, operation, endpoint, format, pagination, normalization, cost and retention metadata. Core owns I/O, retries, credentials, cache, budgets, telemetry and output.

External packages are declarative and read-only. They cannot execute Kujo, native code, shell, filesystem operations, raw GraphQL or mutations. Each request uses a fixed HTTPS endpoint template, denied redirects, schema-enumerated query fields and an environment-variable credential bound to that exact endpoint. Endpoint, capability and credential allowlists are required again at invocation.

The manifest must be canonical JSON and satisfy `schemas/adapter-manifest-v2.schema.json`. Its detached RSA-SHA256 signature covers the canonical manifest bytes. The manifest binds every auxiliary file by SHA-256, so fixture or mapping tampering fails before credentials are read. Trust uses the publisher public-key fingerprint; the display name is not an identity claim.

The Plausible package under `adapters/plausible/` is the reference. Its committed key is a package verification key, not a provider credential. Load that public key into the environment variable named by `--adapter-key-env`; never place API tokens in manifests or configuration.

## v1 migration

Legacy manifests without a `contract` field continue through the v1 loader. To migrate, replace the single request table with capability declarations and read operations, bind credentials to exact endpoint templates, declare cost/retention, move fixtures into package files with SHA-256 digests, emit canonical JSON, and sign the complete manifest. External writes remain unsupported in both versions.
