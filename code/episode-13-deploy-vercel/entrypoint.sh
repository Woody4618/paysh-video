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
# Notes:
#  - Vercel sets PORT=80 and requires the server to listen on it. The Dockerfile
#    runs this container as root so pay can bind port 80 (the non-root base user
#    could not, which caused a startup-timeout failure).
#  - bookworm-slim has no `nc`, and bash cannot LISTEN via /dev/tcp, so a
#    fallback HTTP server isn't reliable here — we log + idle instead, which
#    keeps the container up and the error readable in Runtime Logs.

PORT="${PORT:-80}"
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

# 0) Sanitize env vars: strip ALL leading/trailing whitespace incl. newlines
#    and carriage returns. Pasting values into the Vercel dashboard often adds a
#    trailing newline; if it lands inside a substituted field it splits a YAML
#    line and breaks parsing (e.g. url: 'https://…\n/api/'). Trim defensively.
#    (These are single-line values — URL, pubkey, secret, keypair — so trimming
#    surrounding whitespace is always safe.)
trim() { printf '%s' "$1" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }
PAY_RPC_URL=$(trim "$PAY_RPC_URL")
PAY_PAYMENT_RECIPIENT=$(trim "$PAY_PAYMENT_RECIPIENT")
UPSTREAM_ORIGIN=$(trim "$UPSTREAM_ORIGIN")
GATEWAY_SHARED_SECRET=$(trim "$GATEWAY_SHARED_SECRET")
export GATEWAY_SHARED_SECRET   # pay reads this one natively via value_from_env
# PAY_SIGNER_KEYPAIR: strip only surrounding whitespace/newlines, keep the
# JSON array intact (it has no internal newlines).
PAY_SIGNER_KEYPAIR=$(trim "$PAY_SIGNER_KEYPAIR")

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
#    We use awk (not sed) and treat both the placeholder and the value as
#    LITERAL strings. sed is unsafe here: URLs contain '/', '&', '?', and can
#    contain the delimiter itself (that caused "unterminated s command"), and
#    '&' in a sed replacement is special. awk index()/substr() has no such
#    pitfalls. Values are passed via the environment (ENVIRON), never inlined.
awk '
  function repl(line, ph, val,    out, p) {
    while ((p = index(line, ph)) > 0) {
      out = out substr(line, 1, p - 1) val
      line = substr(line, p + length(ph))
    }
    return out line
  }
  {
    $0 = repl($0, "${PAY_RPC_URL}",         ENVIRON["PAY_RPC_URL"])
    $0 = repl($0, "${PAY_PAYMENT_RECIPIENT}", ENVIRON["PAY_PAYMENT_RECIPIENT"])
    $0 = repl($0, "${UPSTREAM_ORIGIN}",      ENVIRON["UPSTREAM_ORIGIN"])
    print
  }
' "$SPEC_SRC" > "$SPEC_RUNTIME" \
  || serve_error "failed to render runtime spec from $SPEC_SRC"

# Guard: if any of the THREE substituted placeholders survived on a
# non-comment line, something went wrong (typo / missing env). Comment lines
# (which mention ${...} and the commented-out KMS block) are ignored.
if grep -v '^[[:space:]]*#' "$SPEC_RUNTIME" \
   | grep -qE '\$\{(PAY_RPC_URL|PAY_PAYMENT_RECIPIENT|UPSTREAM_ORIGIN)\}'; then
  serve_error "runtime spec still contains an unresolved placeholder on an active line. Check the gateway env vars for typos or newlines."
fi

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
