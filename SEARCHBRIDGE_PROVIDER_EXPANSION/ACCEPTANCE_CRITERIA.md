# Acceptance criteria

The expansion is complete only when all applicable checks have recorded evidence.

## Architecture and compatibility

- [ ] One registry is the source of provider discovery and execution; no parallel provider framework exists.
- [ ] All seven existing providers execute through adapter contract v2 with unchanged deterministic normalized rows.
- [ ] Existing CLI commands, result/submission schemas, 0.2.x goldens and generated SDK consumers pass.
- [ ] External v1 manifests have a documented compatibility/migration path.
- [ ] Built-in and external adapters run the same conformance suite.

## Provider and capability coverage

- [ ] Batch 1 includes DataForSEO, Semrush, SerpApi and Cloudflare built-ins plus a signed Plausible external reference adapter.
- [ ] `serp.results` is covered by two providers; `analytics` by GA4 and Plausible; `edge.analytics` by Cloudflare; selected Semrush/DataForSEO operations cover their declared capabilities.
- [ ] All six new capability row schemas and canonical examples validate.
- [ ] Every proprietary/estimated metric uses provider-qualified metric observations; no universal authority field exists.
- [ ] Provider identity, adapter/API version, query fingerprint, budgets and routing are preserved in every new result.

## Routing and multi-provider

- [ ] Explicit, configured `auto` and `all` have deterministic tested semantics.
- [ ] `auto` explains candidate rejection/selection and performs no undocumented fallback.
- [ ] `all` returns intact provider envelopes, stable order, global/per-provider budgets and explicit partial failures.
- [ ] Incompatible metrics cannot obtain the same comparison key in tests.

## Security and cost

- [ ] External package signature covers canonical manifest and all files; tamper/unknown-key/unknown-version fail before credential access.
- [ ] Final URLs, redirects and download URLs are allowlisted after expansion; credential binding uses exact endpoint templates with no host/path-prefix wildcard.
- [ ] Header, Basic, query and body credentials are absent from errors, cache hashes, telemetry, traces and output.
- [ ] External adapters cannot declare or execute writes.
- [ ] Every `index.submission` invocation still requires capability, `--act` and `--yes`.
- [ ] Call/retry/page/row/cursor/poll/elapsed/concurrency/response/output budgets are enforced and tested.
- [ ] Paid/unknown calls fail before transport without explicit provider enablement and budgets; no default test spends provider quota.
- [ ] Provider retention policy caps replay; Semrush is at most one month absent explicit reviewed permission.

## Fixtures, tests and drift

- [ ] Every operation has the fixture minimum in `08-testing-plan.md`, with no live/private/unlicensed data.
- [ ] JSON, GraphQL and CSV parsers pass adversarial bounds.
- [ ] Offline/fixture/deterministic modes prove zero transport calls.
- [ ] Provider snapshots include docs/version/auth/format/pagination/fixture hash and checked date.
- [ ] Scheduled drift and credential-gated live probes emit sanitized evidence and deduplicate issues.
- [ ] `bash scripts/validate.sh`, SDK gates, platform smokes and adapter conformance all pass.

## Performance and token efficiency

- [ ] Every hard budget in `09-performance-token-budgets.md` passes on a recorded reference environment.
- [ ] Default agent catalog is <= 4 KiB; capability/provider detailed descriptions stay within token targets.
- [ ] Full catalogs/schema sizes/help remain within budgets.
- [ ] 100k-row synthetic streaming stays bounded and publishes atomically.
- [ ] The pre-existing static-command stdout anomaly is closed or proved environment-specific before benchmark acceptance.

## Documentation and release

- [ ] Provider setup/capabilities/authoring/security/signing/routing/cost/agent/MCP/examples have concise canonical docs.
- [ ] No unsupported pricing, partnership, marketplace, redistribution or metric-equivalence claim appears.
- [ ] A clean checkout can install/build and run representative fixture commands without provider credentials.
- [ ] Release qualification records runtime/commit, commands, test counts, benchmark values, external blockers and approved live evidence.
- [ ] Changes are in small meaningful commits, pushed, and the final working tree is clean.
