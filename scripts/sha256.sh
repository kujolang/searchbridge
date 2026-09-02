#!/usr/bin/env bash
set -euo pipefail

if command -v sha256sum >/dev/null 2>&1; then
  if [[ "${1:-}" == "--check" ]]; then
    shift
    exec sha256sum -c "$@"
  fi
  exec sha256sum "$@"
fi

if command -v shasum >/dev/null 2>&1; then
  if [[ "${1:-}" == "--check" ]]; then
    shift
    exec shasum -a 256 -c "$@"
  fi
  exec shasum -a 256 "$@"
fi

printf 'SearchBridge: no SHA-256 utility found (requires sha256sum or shasum).\n' >&2
exit 127
