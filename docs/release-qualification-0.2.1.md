# SearchBridge 0.2.1 release qualification

SearchBridge 0.2.1 completes the production-readiness backlog recorded after
0.2.0. The release is additive within the stable v1 envelope contracts.

Qualification requires `bash scripts/validate.sh` with Kujo commit
`517c5369c6349038831951917478eb66100c1924`, the cross-platform smoke workflow,
and the signed-release verification checklist. Live-provider qualification is
credential-gated and scheduled independently from pull requests.

The release does not claim that scheduled live contracts have passed until the
repository's dedicated low-privilege properties and secrets are provisioned.
No provider credentials or live row contents belong in CI artifacts.
