# Repository governance

The `main` branch is release-bearing. Changes arrive through pull requests,
require an approving review from CODEOWNERS, dismiss stale approvals, resolve
review conversations, and pass the following checks before merge:

- `kujo-native` (`validate` workflow)
- `generated-contracts` (`sdk-compatibility` workflow)
- `launcher-package` (`platform-smoke` workflow)
- `codeql (javascript-typescript)`
- `codeql (go)`
- `dependencies`
- `dependency-review` when applicable
- `secrets`
- `qualify` (`release-candidate` workflow)

Direct pushes, force pushes, branch deletion, and bypasses are disabled. Release
tags match `v*`, are immutable after creation, and may only be created from a
qualified commit on `main`. Release artifacts require generated SBOM, checksum,
signature, and provenance records; provider-dependent evidence is reviewed
before a public tag is created.

GitHub vulnerability alerts, automated security updates, secret scanning with
push protection, and code scanning must remain enabled. Dependabot configuration
is versioned in `.github/dependabot.yml`; security analysis is versioned in
`.github/workflows/security.yml`. Workflow actions are pinned to commit digests.

Repository administrators verify these hosted controls using GitHub's settings
or API after creating the workflows and before each release candidate. The
machine-readable intended rulesets are stored in `.github/rulesets/main.json`
and `.github/rulesets/tags.json`.
