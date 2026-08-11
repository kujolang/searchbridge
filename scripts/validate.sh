#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT/../kujo/target/release/kujo}"
cd "$ROOT"
python3 -m py_compile bridge/searchbridge.py tests/test_searchbridge.py
python3 tests/test_searchbridge.py
"$KUJO_RUNTIME" check searchbridge.kujo
"$KUJO_RUNTIME" run tests/searchbridge_tests.kujo
for schema in schemas/*.json fixtures/providers/*.json; do python3 -m json.tool "$schema" >/dev/null; done
git diff --check
printf 'SearchBridge validation passed.\n'
