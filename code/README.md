# Companion code for the pay.sh 101 screencast series

Runnable specs for the producer-track episodes. Each folder has a README with
the exact commands to run on camera. All specs are verified against
<https://pay.sh/docs> and parse as valid YAML.

| Episode | Folder | What it demos |
|---|---|---|
| 5 | `episode-05-first-gateway/` | Minimal one-file gateway (`respond` routing) |
| 6 | `episode-06-pricing/` | Per-call, token, volume-tier, and variant pricing |
| 7 | `episode-07-subscriptions/` | Recurring `subscription:` endpoint + Plan PDA |
| 8 | `episode-08-splits/` | Percentage and fixed-amount payment splits |
| 10 | `episode-10-publish/` | Registry provider markdown + publish flow |

Episodes 1–4 and 9 are terminal/browser only — no code needed.

All specs follow the canonical shapes from the docs that ship with the `pay`
binary (`skills/pay/references/monetize-api.md`) and the Rust provider-spec
fixtures in [`solana-foundation/pay`](https://github.com/solana-foundation/pay) —
not the legacy `solana-pay` TypeScript packages in that repo.

## Prerequisites

```sh
brew install pay
pay --version
```

Every example runs on `--sandbox` (hosted Surfpool, auto-funded ephemeral
wallet, no real funds).

## Quick start

```sh
cd episode-05-first-gateway
pay --sandbox server start starter.yml          # Terminal A
pay --sandbox curl http://127.0.0.1:1402/v1/reports/usage   # Terminal B
```
