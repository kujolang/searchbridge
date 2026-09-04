# Security and cost boundaries

SearchBridge is a provider gateway, not a credential broker or sandbox.

- Tokens and keys are read from environment variables only and are never serialized.
- Error output is length-bounded and redacts bearer tokens, authorization values, API keys, and query credentials. Provider response bodies and request headers are not exposed.
- Read operations and submission operations are separate commands.
- `submit` requires `--capability index.submission --act --yes` on every invocation, including fixture mode.
- Submission URLs must use HTTP(S), contain no user-info or whitespace, share one syntactically valid host, and fit the 1,000-URL batch bound. Fragments are removed.
- Custom submission endpoints are disabled to prevent credentials from being forwarded to an operator-supplied host.
- Live calls have a 120-second maximum timeout, at most five retries, an 8 MiB provider-response bound, declared page/row bounds, and caller-configurable output byte/token bounds.
- Retries apply only to connection failures, HTTP 429, and transient 5xx statuses. Numeric `Retry-After` is capped and jittered.
- Retry telemetry excludes URLs, headers, bodies, credentials, and row values.
- Config files reject secret-, token-, credential-, and key-shaped fields; credentials remain environment-only.
- Replay hashes redact credential material. Operators may require authenticated AES-256-GCM records using an environment-provided key and may allowlist replayable capabilities. Expired records are deleted and tampered ciphertext fails closed.
- External adapters are declarative read contracts loaded only from detached RSA-SHA256-signed canonical manifests. The manifest binds every package file digest. Every external capability, exact endpoint template, and credential environment variable requires an invocation allowlist; mutation access remains unavailable.
- OpenTelemetry is explicit opt-in. OTLP trace and metric payloads contain bounded operational attributes only and exclude URLs, headers, tokens, bodies, and normalized rows. A committed redaction corpus exercises this boundary.
- Batch cancellation is cooperative: new work and retries stop when the cancel file appears, while a currently executing provider request remains bounded by its timeout.
- Metered, expensive, and unknown live calls require explicit paid enablement plus call and provider-unit budgets before credentials or transport. Estimated and actual provider units remain separate. Fixture mode never consumes provider quota.
- Automatic live routing selects only `stable-live` providers. Direct live use of another enabled tier requires `--allow-unverified-live` and never bypasses paid-call controls.
- Scheduled Google reads use repository/environment-scoped workload identity to mint a 15-minute token with Search Console and Analytics read-only scopes; no credential file is created.
- Fixed final endpoints reject user-info, fragments, private/local destinations, prefix lookalikes, and redirects. Cloudflare accepts variables for one reviewed GraphQL operation, never operator-supplied GraphQL.
- Basic, bearer, header, query, and body credential shapes are removed from errors, request fingerprints, cache keys, and telemetry. Evidence rows remain intact and are never copied into telemetry.
- Cursor repetition, async task IDs, polling time, retry amplification, CSV size/columns/cells, provider response bytes, and cache retention are bounded. Semrush cache/replay age cannot exceed one month.
- Each operation declares its retryable statuses, retry cap, delay cap, and circuit threshold. Task creation and write operations never retry automatically.
- SearchBridge does not refresh OAuth tokens, open browsers, store credentials, or claim that an accepted URL was indexed.

Provider properties, URLs, query rows, and analytics measurements may be
sensitive operational data. Protect process environments, command history, CI
secrets, and output paths according to the operator's data-handling policy.
The same policy applies to cache/replay directories. Encryption protects data
at rest but does not replace filesystem permissions, retention controls, key
rotation, or operator review of exported evidence.
Strict deployments can add Kujo's `--deny-private-net` policy to deny private
and local network destinations at the runtime boundary.

Report vulnerabilities privately to the maintainers. Do not include live
tokens, credential-bearing URLs, provider headers, or private response bodies
in reports or fixtures.
