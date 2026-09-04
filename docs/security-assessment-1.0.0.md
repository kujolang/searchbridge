# SearchBridge 1.0.0 security assessment

Status: repository-local assessment and remediation complete; hosted and independent final-commit evidence pending.

The v1 review covers provider endpoint restrictions, credential placement and redaction, bounded retries/calls/pages/rows/bytes/units/time, cache encryption and integrity, adapter signatures and compatibility, automatic-routing tiers, MCP framing, release artifact contents, and the separate submission boundary. Managed repository-wide scan `0a47d669-485d-4b91-997c-db4bde8913ee` reported seven medium-severity issues. All seven were remediated locally: OTLP destinations now use the private-network transport boundary; Google pagination and Bing submission enforce cumulative budgets; MCP evidence reads require a contained operator root; signed adapter fixtures are containment- and digest-bound; pull-request qualification no longer receives attestation authority; and independent release verification compares both source archives with the signed tag tree. The expanded deterministic regression suite passes with no unresolved release-blocking local finding.

No provider token, service-account file, refresh token, IndexNow key, private signing key, request header, raw credential-bearing URL, or provider row is permitted in qualification artifacts.

Workload Identity Federation replaces long-lived Google keys in scheduled CI. The auth action is pinned to commit `7c6bc770dae815cd3e89ee6cdf493a5fab2cc093`, requests `id-token: write` only in the live job, creates no credential file, and has an unconditional cleanup safeguard. Automatic live routing is restricted to `stable-live`; direct non-stable live use requires `--allow-unverified-live`, and paid preflight remains independent.

Hosted CodeQL, dependency review, secret scanning, npm audit, cargo audit, `govulncheck`, final protected-branch status, and independent release-download verification must be confirmed at the final commit. These external checks are release blockers if they report a high/critical or validated finding; they are not falsely claimed by this local record.
