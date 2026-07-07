#!/bin/sh
# Gateway entrypoint for Vercel container deploys.
#
# Goal: never crash-loop at boot. A misconfiguration should surface at *runtime*
# in Vercel Runtime Logs, not as a stuck "Deploying outputs..." rollout with no
# readable error. So on any failure we log the reason and idle instead of exiting.
#
# How config reaches pay:
#   - PAY_RPC_URL          → passed as the `--rpc-url` flag.
#   - PAY_PAYMENT_RECIPIENT→ passed as the `--recipient` flag.
#   - GATEWAY_SHARED_SECRET→ read natively by pay via `value_from_env` in the YAML.
#   - UPSTREAM_ORIGIN      → the ONE value pay can't source itself. routing.url
#                            lives only in the YAML with no CLI flag, so we
#                            substitute it into a runtime copy of the spec.
#
# Vercel sets PORT (defaults to 80). The Dockerfile runs as root so pay can bind
# the privileged port.

set -eu

PORT="${PORT:-80}"
SPEC_SRC="/app/provider.yml"
SPEC_RUNTIME="/tmp/provider.runtime.yml"
KEYPAIR="/tmp/gateway-keypair.json"

# Log the reason and idle so it stays visible in Runtime Logs (no crash-loop).
fail() {
  echo "GATEWAY STARTUP ERROR: $*" >&2
  echo "Container is idling so this stays visible. Fix env vars and redeploy." >&2
  while :; do sleep 3600; done
}

# Strip surrounding whitespace/newlines — pasting into the Vercel dashboard often
# appends a trailing newline, which would corrupt the YAML line or the flag.
trim() { printf '%s' "$1" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }

PAY_RPC_URL=$(trim "${PAY_RPC_URL:-}")
PAY_PAYMENT_RECIPIENT=$(trim "${PAY_PAYMENT_RECIPIENT:-}")
UPSTREAM_ORIGIN=$(trim "${UPSTREAM_ORIGIN:-}")
GATEWAY_SHARED_SECRET=$(trim "${GATEWAY_SHARED_SECRET:-}")
PAY_SIGNER_KEYPAIR=$(trim "${PAY_SIGNER_KEYPAIR:-}")
export GATEWAY_SHARED_SECRET   # read natively by pay via value_from_env

# Validate required env.
for v in PAY_SIGNER_KEYPAIR PAY_RPC_URL PAY_PAYMENT_RECIPIENT UPSTREAM_ORIGIN GATEWAY_SHARED_SECRET; do
  eval "val=\${$v}"
  [ -n "$val" ] || fail "$v is empty or unset."
done
case "$UPSTREAM_ORIGIN" in http://*|https://*) ;; *) fail "UPSTREAM_ORIGIN must be an absolute URL, got: '$UPSTREAM_ORIGIN'";; esac
case "$PAY_RPC_URL"    in http://*|https://*) ;; *) fail "PAY_RPC_URL must be an absolute URL, got: '$PAY_RPC_URL'";; esac

# Materialize the fee-payer keypair from the env var.
printf '%s' "$PAY_SIGNER_KEYPAIR" > "$KEYPAIR"
[ -s "$KEYPAIR" ] || fail "PAY_SIGNER_KEYPAIR wrote an empty keypair file."

# Substitute the ONE placeholder pay can't source itself: ${UPSTREAM_ORIGIN} in
# routing.url. awk treats both needle and value as literals (unlike sed, which
# chokes on '/', '&', '?' in URLs). ph/length() avoids hardcoding the token width.
awk -v val="$UPSTREAM_ORIGIN" -v ph='${UPSTREAM_ORIGIN}' '
  { while ((p = index($0, ph)) > 0)
      $0 = substr($0, 1, p-1) val substr($0, p+length(ph)); print }
' "$SPEC_SRC" > "$SPEC_RUNTIME" || fail "failed to render runtime spec"
if grep -v '^[[:space:]]*#' "$SPEC_RUNTIME" | grep -q '\${UPSTREAM_ORIGIN}'; then
  fail "UPSTREAM_ORIGIN placeholder survived substitution."
fi

# Start the gateway. If pay exits (bad config, RPC error, etc.), surface why.
echo "Starting pay gateway on :$PORT ..." >&2
log=/tmp/pay-start.log
pay server start "$SPEC_RUNTIME" \
  --bind "0.0.0.0:$PORT" \
  --rpc-url "$PAY_RPC_URL" \
  --recipient "$PAY_PAYMENT_RECIPIENT" 2>&1 | tee "$log"
fail "pay server exited: $(tail -n 5 "$log" | tr '\n' ' ')"
