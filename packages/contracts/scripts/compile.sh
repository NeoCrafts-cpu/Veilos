#!/usr/bin/env bash
# Compile the Wave 1 Compact contract with the Midnight Compact compiler.
# Windows NTFS `compact.exe` is rejected — this must run on Linux/macOS/WSL.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/compact/authorization.compact"
OUT="$ROOT/managed/authorization"

if ! command -v compact >/dev/null 2>&1; then
  echo "ERROR: Midnight Compact compiler is not on PATH." >&2
  echo "Install from https://github.com/midnightntwrk/compact then run: compact update" >&2
  exit 1
fi

COMPACT_BIN="$(command -v compact)"
if [[ "$COMPACT_BIN" == *.exe ]] || [[ "$COMPACT_BIN" == /mnt/c/* ]]; then
  echo "ERROR: Refusing Windows compact.exe (NTFS compression). Use Midnight Compact in WSL." >&2
  exit 1
fi

if compact --help 2>&1 | grep -qiE 'NTFS|compresses files'; then
  echo "ERROR: Refusing Windows compact.exe (NTFS compression). Use Midnight Compact in WSL." >&2
  exit 1
fi

mkdir -p "$OUT"
echo "compact compile $SRC $OUT"
compact compile "$SRC" "$OUT"
echo "Compiled artifacts written to $OUT"
