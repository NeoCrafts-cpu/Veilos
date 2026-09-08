#!/usr/bin/env bash
# Copy Compact ZK artifacts for FetchZkConfigProvider (official MidnightJS 4.1.1 layout).
# Hosted builds (Vercel/Render) use committed files in apps/web/public when managed/ is absent.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/apps/web/public"

copy_circuit_assets() {
  local SRC="$1"
  local keys="$SRC/keys"
  local zkir="$SRC/zkir"
  if [[ ! -d "$keys" || ! -d "$zkir" ]]; then
    return 1
  fi
  mkdir -p "$DEST/keys" "$DEST/zkir"
  local copied=0
  shopt -s nullglob
  local files
  files=("$keys"/*.prover "$keys"/*.verifier)
  if ((${#files[@]} > 0)); then
    cp -f "${files[@]}" "$DEST/keys/"
    copied=1
  fi
  files=("$zkir"/*.bzkir "$zkir"/*.zkir)
  if ((${#files[@]} > 0)); then
    cp -f "${files[@]}" "$DEST/zkir/"
    copied=1
  fi
  shopt -u nullglob
  [[ "$copied" -eq 1 ]]
}

public_ready() {
  [[ -d "$DEST/keys" && -d "$DEST/zkir" ]] || return 1
  shopt -s nullglob
  local provers=("$DEST/keys"/*.prover)
  local circuits=("$DEST/zkir"/*.bzkir "$DEST/zkir"/*.zkir)
  shopt -u nullglob
  ((${#provers[@]} > 0 && ${#circuits[@]} > 0))
}

copied_any=0
if copy_circuit_assets "$ROOT/packages/contracts/managed/authorization"; then
  copied_any=1
fi
if copy_circuit_assets "$ROOT/packages/contracts/managed/economy-preview"; then
  copied_any=1
fi

if [[ "$copied_any" -eq 0 ]]; then
  if public_ready; then
    echo "using committed ZK artifacts in apps/web/public"
    exit 0
  fi
  echo "ENVIRONMENT MISSING: compile contracts first (pnpm compile:contracts)" >&2
  exit 1
fi
