#!/usr/bin/env bash
# Official UI8Kit installer. Writes packages/kit from `npx ui8kit@3` (Svelte).
# Do not copy primitives by hand and do not fetch GitHub JSON as a bypass.
#
# The CLI resolves @ui8kit/registry from CDN, in order:
#   https://unpkg.com/@ui8kit/registry@3/r/svelte/…
#   https://cdn.jsdelivr.net/npm/@ui8kit/registry@3/r/svelte/…
# Pin with --registry-version; retry with --retry. CI does not run this:
# committed packages/kit + ui8kit.lock.json are the installed tree.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KIT_DIR="packages/kit/src"
CLI=(npx --yes ui8kit@3)

run() {
  echo "+ $*" >&2
  "$@"
}

fail_cdn() {
  cat >&2 <<'EOF'
npx ui8kit@3 failed. Retry the official CLI against the registry CDN (do not copy files by hand):

  npx --yes ui8kit@3 init --yes --framework svelte --dir packages/kit/src --retry
  npx --yes ui8kit@3 add --all --force --retry

  npx --yes ui8kit@3 add --all --force --retry \
    --registry-url https://unpkg.com/@ui8kit/registry@3

  npx --yes ui8kit@3 add --all --force --retry --strict-cdn \
    --registry-url https://cdn.jsdelivr.net/npm/@ui8kit/registry@3

  npx --yes ui8kit@3 add --all --force --registry-version 3.4.0

packages/kit is committed, so `bun run verify` does not need this step.
EOF
  exit 1
}

run "${CLI[@]}" init --yes --framework svelte --dir "$KIT_DIR" || fail_cdn
run "${CLI[@]}" add --all --force --retry || fail_cdn
run "${CLI[@]}" check || fail_cdn
echo "kit:install: ok (official npx ui8kit@3 add --all)"
