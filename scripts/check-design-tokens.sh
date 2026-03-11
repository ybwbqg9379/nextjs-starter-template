#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Design Token Compliance Check
#
# Scans TSX files for forbidden patterns that bypass the
# project's design token system. Matches are file-wide,
# not limited to single-line className= occurrences, so
# multi-line className={cn(...)} patterns are also caught.
#
# Usage:
#   bash scripts/check-design-tokens.sh             # scan all src/**/*.tsx
#   bash scripts/check-design-tokens.sh file1.tsx    # scan specific files
# ─────────────────────────────────────────────────────────

set -euo pipefail

# If specific files are passed, use them; otherwise scan all TSX in src/
if [ $# -gt 0 ]; then
  FILES=("$@")
else
  FILES=()
  while IFS= read -r f; do
    FILES+=("$f")
  done < <(find src -name '*.tsx' -not -name '*.test.*' -not -name '*.spec.*')
fi

# Exit early if no files to check
if [ ${#FILES[@]} -eq 0 ]; then
  echo "[PASS] No TSX files to check."
  exit 0
fi

VIOLATIONS=0

# ── Pattern 1: Raw Tailwind font-size classes ──────────────────────────
# Forbidden: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl ... text-9xl
# Allowed:   text-display, text-h1, text-body-sm, text-foreground, etc.
# NOTE: Scans entire file — catches multi-line className={cn(...)} patterns.
RAW_FONT=$(grep -nE '\btext-(xs|sm|base|lg|xl|[2-9]xl)\b' "${FILES[@]}" 2>/dev/null | \
  grep -v 'text-sm:' | \
  grep -v '// eslint-disable' || true)

if [ -n "$RAW_FONT" ]; then
  echo ""
  echo "[FAIL] Raw Tailwind font-size classes (use text-display/h1/h2/h3/body/body-sm/caption):"
  echo "$RAW_FONT" | sed 's/^/   /'
  VIOLATIONS=$((VIOLATIONS + $(echo "$RAW_FONT" | wc -l)))
fi

# ── Pattern 2: Hardcoded colors ────────────────────────────────────────
# Forbidden: text-[#...], bg-[#...], border-[#...],
#            text-[rgb(...)], bg-[rgba(...)], border-[hsl(...)], etc.
HARD_COLOR=$(grep -nE '\b(text|bg|border|ring|outline|shadow|fill|stroke|accent|caret|decoration)-\[(#|rgb|rgba|hsl|hsla|oklch|oklab|color)' "${FILES[@]}" 2>/dev/null | \
  grep -v '// eslint-disable' || true)

if [ -n "$HARD_COLOR" ]; then
  echo ""
  echo "[FAIL] Hardcoded color values (use semantic color tokens):"
  echo "$HARD_COLOR" | sed 's/^/   /'
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARD_COLOR" | wc -l)))
fi

# ── Pattern 3: Non-standard arbitrary values ───────────────────────────
# Forbidden: p-[13px], mt-[22px], mx-[1.5rem], gap-[10px], w-[200px],
#            h-[50px], text-[17px], space-x-[5px], inset-[3px], etc.
# This catches any utility-[<number>...] pattern — i.e. arbitrary values
# that should use Tailwind's standard scale or project tokens.
ARB_VALUE=$(grep -nE '\b(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y|w|min-w|max-w|h|min-h|max-h|top|right|bottom|left|inset|inset-x|inset-y|text|leading|tracking|rounded|border|outline|ring|size)-\[\d' "${FILES[@]}" 2>/dev/null | \
  grep -v '// eslint-disable' || true)

if [ -n "$ARB_VALUE" ]; then
  echo ""
  echo "[FAIL] Non-standard arbitrary values (use Tailwind standard scale or design tokens):"
  echo "$ARB_VALUE" | sed 's/^/   /'
  VIOLATIONS=$((VIOLATIONS + $(echo "$ARB_VALUE" | wc -l)))
fi

# ── Summary ────────────────────────────────────────────────────────────
if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "Found $VIOLATIONS design token violation(s)."
  echo "See docs/ui-design-tokens.md for allowed patterns."
  exit 1
else
  echo "[PASS] Design token compliance check passed."
  exit 0
fi
