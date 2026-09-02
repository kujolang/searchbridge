# Agent, MCP, and workflow integration

Agents should ask for a capability, not a vendor endpoint. `agent-catalog` emits the generated default catalog within 4 KiB. `integrations/searchbridge-tools.json` defines four small provider-neutral tools: catalog, fetch, local evidence query, and submission. Human documentation and endpoint inventories are not included in model context.

An MCP or agent host maps the tool inputs to the matching SearchBridge CLI command and returns JSON unchanged. Limit agent reads to 100 rows and 25,000 output tokens unless a workflow explicitly raises them. Preserve `provider`, `source`, `query.fingerprint`, `routing`, and `budgets` when handing results to Dispatch, WebOps, or another workflow.

Submission is a distinct mutation tool. Its schema requires `capability: index.submission`, `act: true`, and `yes: true`; the CLI independently enforces the same fields on every invocation. Never expose `adapter-run`, provider credentials, endpoint fields, or raw GraphQL as general agent tools.
