#!/usr/bin/env bash
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="$ROOT/dist/sdk"
rm -rf "$OUTPUT"
mkdir -p "$OUTPUT"

(
  cd "$ROOT/sdk/typescript"
  npm ci
  npm run build
  npm pack --pack-destination "$OUTPUT"
)
(
  cd "$ROOT/sdk/rust"
  cargo test --locked
  cargo package --allow-dirty --locked
  cp "target/package/searchbridge-$(tr -d '\n' < "$ROOT/VERSION").crate" "$OUTPUT/"
)
(
  cd "$ROOT/sdk/go"
  go test ./...
  tar --exclude='.DS_Store' -czf "$OUTPUT/searchbridge-go-$(tr -d '\n' < "$ROOT/VERSION").tar.gz" .
)

(
  cd "$OUTPUT"
  bash "$ROOT/scripts/sha256.sh" ./*.tgz ./*.crate ./*.tar.gz > SHA256SUMS
)
commit="$(git -C "$ROOT" rev-parse HEAD)"
version="$(tr -d '\n' < "$ROOT/VERSION")"
node -e 'const fs=require("fs"); const [out,version,commit]=process.argv.slice(1); const sums=fs.readFileSync(`${out}/SHA256SUMS`,"utf8").trim().split("\n").map(line=>{const [sha256,name]=line.trim().split(/\s+/,2);return {name,sha256}}); fs.writeFileSync(`${out}/provenance.json`,JSON.stringify({schema:"searchbridge.sdk-provenance/v1",version,source_commit:commit,artifacts:sums})+"\n",{mode:0o600});' "$OUTPUT" "$version" "$commit"
printf 'Packaged TypeScript, Rust, and Go SDKs with checksums and provenance.\n'
