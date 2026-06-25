# Episode 5 — Your First Paid Gateway

Two ways to demo a paid gateway. Pick one on camera.

## Option A — zero-code (recommended for the cold open)

No spec needed. `pay server demo` ships a bundled spec with metered endpoints,
splits, and tiered pricing, and turns the debugger on automatically under
`--sandbox`.

```sh
# Terminal A — start the bundled demo gateway (writes pay-demo.yaml here)
pay --sandbox server demo

# Terminal B — call a metered endpoint and pay
pay --sandbox curl http://127.0.0.1:1402/api/v1/reports/usage
```

Open `http://127.0.0.1:1402/` to watch the flow in the debugger.

## Option B — your own one-file spec (this folder)

`starter.yml` is the smallest complete spec: one free endpoint, one metered
endpoint, no upstream (`routing.type: respond`).

```sh
# Terminal A — serve your spec (debugger is automatic under --sandbox)
pay --sandbox server start starter.yml

# Terminal B — free endpoint, no payment
pay --sandbox curl http://127.0.0.1:1402/v1/health

# Terminal B — metered endpoint: 402 -> sign -> 200
pay --sandbox curl http://127.0.0.1:1402/v1/reports/usage
```

## Docs

- Getting started: https://pay.sh/docs/building-with-pay/getting-started
- YAML specification: https://pay.sh/docs/building-with-pay/yaml-specification
- `pay server` reference: https://pay.sh/docs/toolchain/commands/developers
