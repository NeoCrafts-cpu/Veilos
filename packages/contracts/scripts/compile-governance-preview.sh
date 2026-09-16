#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/compact/governance-preview.compact"
OUT="$ROOT/managed/governance-preview"
if ! command -v compact >/dev/null 2>&1; then
  echo "ERROR: Midnight Compact compiler is not on PATH." >&2
  exit 1
fi
mkdir -p "$OUT"
echo "compact compile $SRC $OUT"
compact compile "$SRC" "$OUT"
echo "Compiled Preview governance artifacts written to $OUT"
