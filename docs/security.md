# Security and cost boundaries

SearchBridge is a provider gateway, not a credential broker or sandbox.

- Tokens and keys are read from environment variables only and are never serialized.
- Error output is length-bounded and redacts bearer tokens, authorization values, API keys, and query credentials. Provider response bodies and request headers are not exposed.
- Read operations and submission operations are separate commands.
- `submit` requires `--capability index.submission --act --yes` on every invocation, including fixture mode.
- Submission URLs must use HTTP(S), contain no user-info or whitespace, share one syntactically valid host, and fit the 1,000-URL batch bound. Fragments are removed.
- Custom submission endpoints are disabled to prevent credentials from being forwarded to an operator-supplied host.
- Live calls have a 120-second maximum timeout, at most five retries, an 8 MiB provider-response bound, a 1,000-row bound, and caller-configurable output byte/token bounds.
- Retries apply only to connection failures, HTTP 429, and transient 5xx statuses, with capped exponential backoff.
- Ahrefs calls may consume paid provider units. Live output labels its cost class; fixture mode never consumes provider quota.
- SearchBridge does not refresh OAuth tokens, open browsers, store credentials, or claim that an accepted URL was indexed.

Provider properties, URLs, query rows, and analytics measurements may be
sensitive operational data. Protect process environments, command history, CI
secrets, and output paths according to the operator's data-handling policy.
Strict deployments can add Kujo's `--deny-private-net` policy to deny private
and local network destinations at the runtime boundary.

Report vulnerabilities privately to the maintainers. Do not include live
tokens, credential-bearing URLs, provider headers, or private response bodies
in reports or fixtures.
