#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
(
  cd "$ROOT/sdk/typescript"
  npm ci
  npm run check
  npm run build
  node dist/example.js
)
(
  cd "$ROOT/sdk/rust"
  cargo test --locked
  cargo run --example fixture --locked
)
(
  cd "$ROOT/sdk/go"
  go test ./...
)
printf 'TypeScript, Rust, and Go SDK clients compile, test, and execute fixtures.\n'
