# Acceptance criteria

The expansion is complete only when all applicable checks have recorded evidence.

## Architecture and compatibility

- [x] One registry is the source of provider discovery and execution; no parallel provider framework exists.
- [x] All seven existing providers execute through adapter contract v2 with unchanged deterministic normalized rows.
- [x] Existing CLI commands, result/submission schemas, 0.2.x goldens and generated SDK consumers pass.
- [x] External v1 manifests have a documented compatibility/migration path.
- [x] Built-in and external adapters run the same conformance suite.

## Provider and capability coverage

- [x] Batch 1 includes DataForSEO, Semrush, SerpApi and Cloudflare built-ins plus a signed Plausible external reference adapter.
- [x] `serp.results` is covered by two providers; `analytics` by GA4 and Plausible; `edge.analytics` by Cloudflare; selected Semrush/DataForSEO operations cover their declared capabilities.
- [x] All six new capability row schemas and canonical examples validate.
- [x] Every proprietary/estimated metric uses provider-qualified metric observations; no universal authority field exists.
- [x] Provider identity, adapter/API version, query fingerprint, budgets and routing are preserved in every new result.

## Routing and multi-provider

- [x] Explicit, configured `auto` and `all` have deterministic tested semantics.
- [x] `auto` explains candidate rejection/selection and performs no undocumented fallback.
- [x] `all` returns intact provider envelopes, stable order, global/per-provider budgets and explicit partial failures.
- [x] Incompatible metrics cannot obtain the same comparison key in tests.

## Security and cost

- [x] External package signature covers canonical manifest and all files; tamper/unknown-key/unknown-version fail before credential access.
- [x] Final URLs, redirects and download URLs are allowlisted after expansion; credential binding uses exact endpoint templates with no host/path-prefix wildcard.
- [x] Header, Basic, query and body credentials are absent from errors, cache hashes, telemetry, traces and output.
- [x] External adapters cannot declare or execute writes.
- [x] Every `index.submission` invocation still requires capability, `--act` and `--yes`.
- [x] Call/retry/page/row/cursor/poll/elapsed/concurrency/response/output budgets are enforced and tested.
- [x] Paid/unknown calls fail before transport without explicit provider enablement and budgets; no default test spends provider quota.
- [x] Provider retention policy caps replay; Semrush is at most one month absent explicit reviewed permission.

## Fixtures, tests and drift

- [x] Every operation has the fixture minimum in `08-testing-plan.md`, with no live/private/unlicensed data.
- [x] JSON, GraphQL and CSV parsers pass adversarial bounds.
- [x] Offline/fixture/deterministic modes prove zero transport calls.
- [x] Provider snapshots include docs/version/auth/format/pagination/fixture hash and checked date.
- [x] Scheduled drift and credential-gated live probes emit sanitized evidence and deduplicate issues.
- [x] `bash scripts/validate.sh`, SDK gates, platform smokes and adapter conformance all pass.

## Performance and token efficiency

- [x] Every hard budget in `09-performance-token-budgets.md` passes on a recorded reference environment.
- [x] Default agent catalog is <= 4 KiB; capability/provider detailed descriptions stay within token targets.
- [x] Full catalogs/schema sizes/help remain within budgets.
- [x] 100k-row synthetic streaming stays bounded and publishes atomically.
- [x] The pre-existing static-command stdout anomaly is closed or proved environment-specific before benchmark acceptance.

## Documentation and release

- [x] Provider setup/capabilities/authoring/security/signing/routing/cost/agent/MCP/examples have concise canonical docs.
- [x] No unsupported pricing, partnership, marketplace, redistribution or metric-equivalence claim appears.
- [x] A clean checkout can install/build and run representative fixture commands without provider credentials.
- [x] Release qualification records runtime/commit, commands, test counts, benchmark values, external blockers and approved live evidence.
- [x] Changes are in small meaningful commits, pushed, and the final working tree is clean.

Evidence for these checks is recorded in `docs/release-qualification-0.4.0.md`. Credential-gated live evidence was not authorized for this qualification and is recorded there as an external blocker rather than replaced with fabricated evidence.
