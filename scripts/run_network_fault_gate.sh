#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KUJO_RUNTIME="${KUJO_BIN:-$ROOT_DIR/../kujo/target/release/kujo}"
GATE_DIR="$(mktemp -d)"
cleanup() {
  kill "${HTTP_PID:-}" "${HTTPS_PID:-}" 2>/dev/null || true
  wait "${HTTP_PID:-}" "${HTTPS_PID:-}" 2>/dev/null || true
  rm -rf "$GATE_DIR"
}
trap cleanup EXIT
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj '/CN=localhost' -keyout "$GATE_DIR/key.pem" -out "$GATE_DIR/cert.pem" >/dev/null 2>&1
rustc "$ROOT_DIR/tests/http_fault_server.rs" -O -o "$GATE_DIR/http-fault-server"
"$GATE_DIR/http-fault-server" "$GATE_DIR/http.port" & HTTP_PID=$!
TLS_PORT="$("$GATE_DIR/http-fault-server" --free-port)"
openssl s_server -quiet -accept "127.0.0.1:$TLS_PORT" -cert "$GATE_DIR/cert.pem" -key "$GATE_DIR/key.pem" -www >/dev/null 2>&1 & HTTPS_PID=$!
printf '%s' "$TLS_PORT" > "$GATE_DIR/https.port"
for _ in $(seq 1 100); do
  if [[ -s "$GATE_DIR/http.port" && -s "$GATE_DIR/https.port" ]]; then break; fi
  sleep 0.05
done
test -s "$GATE_DIR/http.port"
test -s "$GATE_DIR/https.port"
NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost KUJO_NET_ALLOW_PRIVATE_DESTINATIONS=1 "$KUJO_RUNTIME" run "$ROOT_DIR/scripts/network_fault_gate.kujo" "http://127.0.0.1:$(<"$GATE_DIR/http.port")" "https://127.0.0.1:$(<"$GATE_DIR/https.port")"
