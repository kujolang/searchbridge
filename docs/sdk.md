# SDKs

SearchBridge ships source SDK packages for TypeScript, Rust, and Go. Each
package contains generated contract types plus a small standard-library client,
typed process errors, contract validation, JSONL streaming helpers, tests, and
a fixture example. SDK clients execute the local `searchbridge` launcher; they
do not implement provider authentication or networking independently.

- TypeScript: `sdk/typescript`, package `@kujolang/searchbridge`
- Rust: `sdk/rust`, crate `searchbridge`
- Go: `sdk/go`, module `github.com/kujolang/searchbridge/sdk/go`

Set `SEARCHBRIDGE_BIN` or pass an explicit executable path. Pass arguments as
arrays; SDK clients never invoke a shell. Provider credentials remain in the
process environment and all CLI confirmation, budget, endpoint, and redaction
controls remain authoritative.

Run `bash scripts/package_sdks.sh` to compile, test, package, and create
`dist/sdk/SHA256SUMS` plus `dist/sdk/provenance.json`. The resulting npm and
Cargo archives and the versioned Go source archive are locally installable and
bind their source commit and package digests.

For v1, download those three archives and `dist/sdk/SHA256SUMS` from the GitHub
release; public npm, crates.io, and Go proxy publication is not claimed. Verify
the checksum before installing the TypeScript `.tgz`, Rust `.crate`, or Go
source archive in a consumer workspace. Each SDK launches the independently
verified SearchBridge runtime selected by `SEARCHBRIDGE_BIN`.
