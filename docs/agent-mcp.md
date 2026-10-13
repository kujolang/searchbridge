# Agent, MCP, and workflow integration

Agents should ask for a capability, not a vendor endpoint. `agent-catalog` emits the generated default catalog within 4 KiB. `integrations/searchbridge-tools.json` defines four small provider-neutral tools: catalog, fetch, local evidence query, and submission. Human documentation and endpoint inventories are not included in model context.

Run the local stdio MCP server with `node integrations/searchbridge-mcp.mjs`.
It reads newline-delimited MCP JSON-RPC messages on stdin, generates its
`tools/list` surface from `integrations/searchbridge-tools.json`, invokes the
CLI without a shell, and returns both text and structured JSON content. Set
`SEARCHBRIDGE_BIN` only when the CLI launcher is installed elsewhere.
Set `SEARCHBRIDGE_MCP_EVIDENCE_ROOT` to the canonical directory that the local
evidence-query tool may read. The server omits `searchbridge_query` when this
root is absent and rejects path escapes, symlinks, and non-regular files.
The server negotiates MCP `2025-11-25` and `2025-06-18`, caps each inbound
message at 4 MiB (independently of pipe chunk boundaries), bounds retained child
stderr to 64 KiB, honors stdout backpressure, and writes no non-protocol data to stdout.

For `searchbridge_fetch`, fixture calls may omit `max_calls`; live calls must
supply an integer from 1 to 1,000. Optional `property`, `start_date`, `end_date`,
and `url` fields map to their CLI options and support the stable live providers.
The bridge passes a 25,000 estimated-token ceiling for fetch/query calls and
rejects unknown arguments instead of silently dropping them. Paid-provider
opt-ins and endpoint overrides remain outside this tool surface.

An MCP or agent host maps the tool inputs to the matching SearchBridge CLI command and returns JSON unchanged. Limit agent reads to 100 rows and 25,000 output tokens unless a workflow explicitly raises them. Preserve `provider`, `source`, `query.fingerprint`, `routing`, and `budgets` when handing results to Dispatch, WebOps, or another workflow.

Submission is a distinct mutation tool. Its schema requires `capability: index.submission`, `act: true`, `yes: true`, and a positive `max_calls`; the CLI independently enforces the same fields on every invocation. A Bing batch cannot contain more URLs than its call budget. Never expose `adapter-run`, provider credentials, endpoint fields, or raw GraphQL as general agent tools.

The bridge inherits the caller's environment because provider credentials are
environment-only. Configure MCP hosts with least-privilege credentials, an
explicit working directory, provider call/unit budgets, and output retention
appropriate to the agent. The server never logs requests or tool results.
