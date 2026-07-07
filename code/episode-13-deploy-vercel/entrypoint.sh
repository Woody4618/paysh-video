#!/bin/sh
# Gateway entrypoint for Vercel container deploys.
#
# Goal: NEVER crash-loop at boot. Any misconfiguration should surface at
# *runtime* — visible in Vercel Runtime Logs — instead of the container exiting
# before startup (which shows up as a stuck "Deploying outputs..." rollout with
# no readable error).
#
# Strategy:
#   1. Validate env + substitute ${VAR}s into a runtime spec.
#   2. Try to start `pay server start`.
#   3. If prep fails, OR if `pay` exits, log the reason loudly and idle so the
#      error is visible in Vercel Runtime Logs (instead of crash-looping).
#
# pay reads rpc_url / recipient / routing.url LITERALLY (no ${VAR} expansion),
# so we substitute those here. GATEWAY_SHARED_SECRET is resolved natively by pay
# via `value_from_env`, so it is only validated, not substituted.
#
# The base image is Debian bookworm running as non-root USER `pay`:
#  - Non-root CANNOT bind ports < 1024, so we default PORT to 8080 (Vercel
#    injects its own high $PORT in production).
#  - bookworm-slim has no `nc`, and bash cannot LISTEN via /dev/tcp, so a
#    fallback HTTP server isn't reliable here — we log + idle instead, which
#    keeps the container up and the error readable in Runtime Logs.

PORT="${PORT:-8080}"
SPEC_SRC="/app/provider.yml"
SPEC_RUNTIME="/tmp/provider.runtime.yml"
KEYPAIR="/tmp/gateway-keypair.json"

# Log `reason` (arg 1) loudly and idle so the container stays up and the error
# remains visible in Vercel Runtime Logs (no crash-loop, no stuck rollout).
serve_error() {
  reason="$1"
  echo "==================================================================" >&2
  echo "GATEWAY STARTUP ERROR: $reason" >&2
  echo "The container is idling so this message stays visible in Runtime" >&2
  echo "Logs. Fix the issue in the gateway project env vars and redeploy." >&2
  echo "==================================================================" >&2
  while true; do
    echo "GATEWAY STARTUP ERROR (still idling): $reason" >&2
    sleep 60
  done
}

# 1) Validate required env vars.
for v in PAY_SIGNER_KEYPAIR PAY_RPC_URL PAY_PAYMENT_RECIPIENT UPSTREAM_ORIGIN GATEWAY_SHARED_SECRET; do
  eval val="\$$v"
  if [ -z "$val" ]; then
    serve_error "env var $v is empty or unset. Set it in the gateway project env vars, then redeploy."
  fi
done

# 2) Materialize the fee-payer keypair.
printf '%s' "$PAY_SIGNER_KEYPAIR" > "$KEYPAIR"
bytes=$(tr -cd '0-9' < "$KEYPAIR" | wc -c | tr -d ' ')
if [ "$(wc -c < "$KEYPAIR" | tr -d ' ')" = "0" ]; then
  serve_error "PAY_SIGNER_KEYPAIR wrote an empty keypair file. Check the env var value."
fi

# 3) Substitute the literal ${VAR} fields into a runtime spec.
sed \
  -e "s|\${PAY_RPC_URL}|$PAY_RPC_URL|g" \
  -e "s|\${PAY_PAYMENT_RECIPIENT}|$PAY_PAYMENT_RECIPIENT|g" \
  -e "s|\${UPSTREAM_ORIGIN}|$UPSTREAM_ORIGIN|g" \
  "$SPEC_SRC" > "$SPEC_RUNTIME" \
  || serve_error "failed to render runtime spec from $SPEC_SRC"

# 4) Start the gateway. If it exits (config validation failure, RPC error,
#    bad keypair, etc.), capture the reason and log it instead of crashing.
echo "Starting pay gateway on :$PORT ..." >&2
pay_log="/tmp/pay-start.log"
# Run pay directly (not through a pipe) so $? is pay's own exit status, then
# mirror its output to the log for the error path. `pay` runs in the foreground;
# for a healthy long-running server this line never returns.
pay server start "$SPEC_RUNTIME" --bind "0.0.0.0:$PORT" 2>&1 | tee "$pay_log"
pay_status=${PIPESTATUS:-$?}

reason=$(tail -n 5 "$pay_log" | tr '\n' ' ' | sed 's/"/\\"/g')
serve_error "pay server exited (status ${pay_status}): ${reason:-see runtime logs}"
