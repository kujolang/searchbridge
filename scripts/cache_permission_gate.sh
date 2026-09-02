#!/usr/bin/env bash
set -euo pipefail
umask 077
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT_DIR/../kujo/target/release/kujo}"
GATE_DIR="$(mktemp -d)"
cleanup() { rm -rf "$GATE_DIR"; }
trap cleanup EXIT
CACHE_DIR="$GATE_DIR/cache"
CACHE_FILE="$($KUJO_RUNTIME run "$ROOT_DIR/scripts/cache_permission_probe.kujo" "$CACHE_DIR")"
if stat -f '%Lp' "$CACHE_FILE" >/dev/null 2>&1; then FILE_MODE="$(stat -f '%Lp' "$CACHE_FILE")"; DIR_MODE="$(stat -f '%Lp' "$CACHE_DIR")"; else FILE_MODE="$(stat -c '%a' "$CACHE_FILE")"; DIR_MODE="$(stat -c '%a' "$CACHE_DIR")"; fi
if [[ "$FILE_MODE" != "600" || "$DIR_MODE" != "700" ]]; then printf 'Unsafe cache permissions: file=%s dir=%s\n' "$FILE_MODE" "$DIR_MODE" >&2; exit 1; fi
printf 'Cache files and directories are owner-only.\n'
