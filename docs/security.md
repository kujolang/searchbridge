# Security and cost boundaries

- Tokens and keys are read from environment variables only and never serialized.
- Error output includes provider, HTTP status, and a bounded generic message, not request headers or full provider bodies.
- Read operations and write operations are separate commands.
- `submit` requires both `--act` and `--yes`; fixture submission still exercises the gate.
- URLs submitted in one batch must share the declared host and use HTTP(S).
- Live calls have bounded timeouts, row limits, response sizes, and no automatic retry loop.
- Ahrefs live calls require `--limit` no greater than 1,000 and may consume paid units.
- Provider properties, query/page rows, and analytics measurements can be sensitive operational data; output directories should be access-controlled by the operator.
- SearchBridge does not refresh OAuth tokens, open browsers, or persist credentials.
