#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
version="$(tr -d '\r\n' < VERSION)"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
[[ "$version" == "1.0.0" ]]
grep -Fq "version = \"$version\"" kujo.toml
grep -Fq "version = \"$version\"" sdk/rust/Cargo.toml
grep -Fq "export VERSION := \"$version\"" src/core.kujo
node -e 'const fs=require("fs");const v=fs.readFileSync("VERSION","utf8").trim();for(const p of ["sdk/typescript/package.json","sdk/typescript/package-lock.json"]){const d=JSON.parse(fs.readFileSync(p,"utf8"));if(d.version!==v)process.exit(1)}const m=JSON.parse(fs.readFileSync("sdk/manifest.json","utf8"));if(m.contract_series!=="1.x")process.exit(1);const g=JSON.parse(fs.readFileSync("fixtures/golden/1.0/manifest.json","utf8"));if(g.compatible_series!=="1.x")process.exit(1)'
awk -v version="$version" '$1=="name"&&$3=="\"searchbridge\""{seen=1;next} seen&&$1=="version"{gsub(/\"/,"",$3);exit($3==version?0:1)}' sdk/rust/Cargo.lock
if grep -REn --exclude-dir=target 'searchbridge-0\.4\.0|tags:.*v0\.\*\.\*|version: .0\.4\.0.|version-0\.4\.0' .github integrations README.md sdk src kujo.toml VERSION; then
  printf 'SearchBridge: stale authoritative 0.4.0 version surface remains.\n' >&2
  exit 1
fi
printf 'SearchBridge version surfaces agree on %s.\n' "$version"
