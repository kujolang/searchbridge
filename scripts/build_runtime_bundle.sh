#!/usr/bin/env bash
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-}"
PLATFORM="${1:-}"
if [[ -z "$KUJO_RUNTIME" || ! -f "$KUJO_RUNTIME" ]]; then printf 'Set KUJO_BIN to a built Kujo runtime.\n' >&2; exit 2; fi
if [[ ! "$PLATFORM" =~ ^(linux-x64|macos-x64|macos-arm64|windows-x64)$ ]]; then printf 'Unsupported bundle platform.\n' >&2; exit 2; fi
VERSION="$(tr -d '\n' < "$ROOT/VERSION")"
OUTPUT="$ROOT/dist/runtime"
ARCHIVE="$OUTPUT/searchbridge-$VERSION-$PLATFORM.tar.gz"
WORK="$(mktemp -d)"
STAGE="$WORK/searchbridge-$VERSION"
mkdir -p "$STAGE/runtime" "$OUTPUT"
git -C "$ROOT" archive HEAD | tar -xf - -C "$STAGE"
extension=""; if [[ "$PLATFORM" == windows-x64 ]]; then extension=".exe"; fi
cp "$KUJO_RUNTIME" "$STAGE/runtime/kujo$extension"
chmod 755 "$STAGE/runtime/kujo$extension"
source_commit="$(git -C "$ROOT" rev-parse HEAD)"
runtime_sha="$(shasum -a 256 "$KUJO_RUNTIME" | awk '{print $1}')"
kujo_commit="${KUJO_COMMIT:-unknown}"
node -e 'const fs=require("fs"); const [path,version,platform,source,kujo,sha]=process.argv.slice(1); fs.writeFileSync(path,JSON.stringify({schema:"searchbridge.runtime-bundle/v1",version,platform,source_commit:source,kujo_commit:kujo,runtime_sha256:sha})+"\n",{mode:0o600});' "$STAGE/BUNDLE-MANIFEST.json" "$VERSION" "$PLATFORM" "$source_commit" "$kujo_commit" "$runtime_sha"
find "$STAGE" -exec touch -t 202601010000 {} +
(
  cd "$WORK"
  find "searchbridge-$VERSION" -type f | LC_ALL=C sort > files.txt
  COPYFILE_DISABLE=1 tar -cf "$ARCHIVE.tmp" -T files.txt
)
gzip -n -c "$ARCHIVE.tmp" > "$ARCHIVE"
rm "$ARCHIVE.tmp"
shasum -a 256 "$ARCHIVE" > "$ARCHIVE.sha256"
rm -rf "$WORK"
printf '%s\n' "$ARCHIVE"
