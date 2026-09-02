#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT/../kujo/target/release/kujo}"
EXAMPLE_CACHE="$(mktemp -d)"
cleanup() { rm -rf "$EXAMPLE_CACHE"; }
trap cleanup EXIT
cd "$ROOT"
"$KUJO_RUNTIME" run examples/encrypted_replay_ci.kujo "$EXAMPLE_CACHE"
"$KUJO_RUNTIME" run examples/external_adapter_starter.kujo
