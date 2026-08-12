#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT/../kujo/target/release/kujo}"
if [[ ! -x "$KUJO_RUNTIME" ]] && command -v kujo >/dev/null 2>&1; then KUJO_RUNTIME="$(command -v kujo)"; fi
if [[ ! -x "$KUJO_RUNTIME" ]]; then printf 'SearchBridge: Kujo runtime not found. Set KUJO_BIN.\n' >&2; exit 2; fi
cd "$ROOT"
"$KUJO_RUNTIME" check searchbridge.kujo
"$KUJO_RUNTIME" run tests/searchbridge_tests.kujo
"$KUJO_RUNTIME" run scripts/validate_json.kujo
"$KUJO_RUNTIME" run scripts/benchmark.kujo -- --iterations 10 >/dev/null
KUJO_BIN="$KUJO_RUNTIME" ./searchbridge version >/dev/null
KUJO_BIN="$KUJO_RUNTIME" ./searchbridge search-performance --fixture --offline --deterministic >/dev/null
if KUJO_BIN="$KUJO_RUNTIME" ./searchbridge not-a-command >/dev/null 2>&1; then
	printf 'SearchBridge validation failed: unknown command succeeded.\n' >&2
	exit 1
else
	status=$?
	if [[ "$status" -ne 2 ]]; then printf 'SearchBridge validation failed: unknown command exit was %s.\n' "$status" >&2; exit 1; fi
fi
if rg -n 'python3|\.py\b' src tests scripts/benchmark.kujo scripts/validate_json.kujo searchbridge.kujo kujo.toml; then
	printf 'SearchBridge validation failed: Python dependency reference remains.\n' >&2
	exit 1
fi
git diff --check
printf 'SearchBridge validation passed.\n'
