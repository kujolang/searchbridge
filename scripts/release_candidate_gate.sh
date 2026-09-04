#!/usr/bin/env bash
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT/../kujo/target/release/kujo}"
[[ -x "$KUJO_RUNTIME" ]]
cd "$ROOT"
bash scripts/version_consistency_gate.sh
bash scripts/package_sdks.sh
"$KUJO_RUNTIME" run scripts/release_artifacts.kujo
case "$(uname -s)-$(uname -m)" in
  Darwin-x86_64) platform=macos-x64 ;;
  Darwin-arm64) platform=macos-arm64 ;;
  Linux-x86_64) platform=linux-x64 ;;
  *) printf 'SearchBridge: no local bundle qualification mapping for this host.\n' >&2; exit 2 ;;
esac
archive="$(KUJO_BIN="$KUJO_RUNTIME" bash scripts/build_runtime_bundle.sh "$platform")"
first="$(bash scripts/sha256.sh "$archive" | awk '{print $1}')"
archive="$(KUJO_BIN="$KUJO_RUNTIME" bash scripts/build_runtime_bundle.sh "$platform")"
second="$(bash scripts/sha256.sh "$archive" | awk '{print $1}')"
[[ "$first" == "$second" ]]
(cd "$(dirname "$archive")" && bash "$ROOT/scripts/sha256.sh" --check "$(basename "$archive").sha256")
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
tar -xzf "$archive" -C "$work"
version="$(tr -d '\r\n' < VERSION)"
"$work/searchbridge-$version/searchbridge" version >/dev/null
"$work/searchbridge-$version/searchbridge" analytics --fixture --offline --deterministic >/dev/null
for artifact in "dist/sdk/kujolang-searchbridge-$version.tgz" "dist/sdk/searchbridge-$version.crate" "dist/sdk/searchbridge-go-$version.tar.gz" "dist/searchbridge-$version.spdx.json" "dist/searchbridge-$version.provenance.json"; do [[ -s "$artifact" ]]; done
printf 'SearchBridge local release candidate artifacts passed reproducibility and clean-install checks.\n'
