# Episode 11 — From Sandbox to Mainnet

The cutover is a flag flip plus real signers. Business logic and endpoint
pricing stay byte-for-byte identical; only `operator.network`, `operator.signer`,
and `operator.rpc_url` change.

```sh
# Inspect / fund the production wallet
pay --mainnet whoami
pay topup

# Boot the gateway on mainnet against your RPC and signer
pay --mainnet server start provider.mainnet.yml --bind 0.0.0.0:1402

# Smoke test from another terminal (this spends REAL funds)
pay --mainnet curl http://<your-host>:1402/v1/reports/usage
```

## Demo safely without spending mainnet funds

To show the Touch ID prompt on camera without moving real money, keep using
`--sandbox` and force the auth prompt via `~/.config/pay/accounts.yml`:

```yaml
localnet:
  default:
    keystore: ephemeral
    auth_required: true
```

## Signer forms

Two documented `operator.signer` shapes:

```yaml
# Production (recommended in skills/pay/references/monetize-api.md)
operator:
  signer:
    backend: gcp-kms
    key_name: '${PAY_GCP_KMS_KEY_NAME}'
    pubkey: '${PAY_GCP_KMS_PUBKEY}'
```

```yaml
# Simpler file keypair (per pay.sh/docs YAML spec page)
operator:
  signer:
    type: file
    path: /etc/pay/keypair.json
```

When `operator.signer` is omitted entirely, the gateway signs with the active
account in `~/.config/pay/accounts.yml`.

## Cloud-native deploy (from the repo reference)

```sh
# Pinned container image — avoid mutable `latest` in production.
# ghcr.io/solana-foundation/pay:<version>

# One `server start` per provider/upstream; bind the platform port.
pay server start /app/providers/prod-gateway.yml \
  --bind 0.0.0.0:8080 \
  --otlp-sidecar 127.0.0.1:4318
```

- Store API keys, RPC URLs, recipient config in your cloud secret manager —
  inject as env vars, never bake into the image or YAML.
- Keep recipient and fee-payer wallets separate; the fee payer only needs SOL
  for fees, not treasury funds.
- Export telemetry with `--otlp-sidecar` and alert on payment/settlement
  failures, not just process health.

## Gotchas (verified against repo + docs)

- **Never** inline a signer secret in YAML. Use KMS (`backend: gcp-kms`) or pin
  a file `path`, and rotate via your secrets manager.
- `pay` does not daemonize — front a public deploy with systemd / pm2 / Cloud Run.
- Test the mainnet spec under `--sandbox` first by swapping only `network` and
  `rpc_url`; every other line stays the same.
- Default bind is `0.0.0.0:1402`.

## Docs

- Monetize / deploy reference (repo): https://github.com/solana-foundation/pay/blob/main/skills/pay/references/monetize-api.md
- Global flags (network selection): https://pay.sh/docs/toolchain/global-flags
- Sandbox & networks: https://pay.sh/docs/pay-for-apis/sandbox-and-networks
- Deploy: https://pay.sh/docs/accept-payments/deploy
- Top-up: https://pay.sh/docs/using-pay/topup
