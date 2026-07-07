# Episode 8 — Splitting Payments Across Recipients

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/accept-payments/payment-splits>
**Code:** `code/episode-08-splits/splits.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "Splitting Payments. 
  Often recieving payments to only on address is not enough. You want to split the payment across multiple addresses.
  Marketplaces, affiliates, tax withholding, platform fees, tips — almost every
  real payment ends up getting split somehow. Pay lets you express those splits
  right in the server YAML: you name your recipients, and then you route either a
  percentage or a fixed amount to each of them."

### Scene 2 — Named recipients (0:20–0:55)

- 🖥️ Open `splits.yml` or the demo's `pay-demo.yaml`; show the top-level
  `recipients:` map (`partner`, `tax_authority`).
- 🎙️ "You declare your recipients once at the top of the file and then refer to
  them by name everywhere else. The reason that matters is readability — a name
  like `partner` documents itself, whereas a raw public key is just a guessing
  game when you come back to it later."

### Scene 3 — Percentage split (0:55–1:30)

- 🖥️ Show `v1/report` → 20% to partner.
- ⌨️ You run:

```sh
pay --sandbox server start splits.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/report -d '{}'
```

### Scene 4 — Fixed + mixed (1:30–2:05)

- 🖥️ Show `v1/invoice` → fixed $0.20 tax + 10% affiliate.
- 🎙️ "Each split uses either an amount or a percent, but never both. And the
  important part is that the splits settle inside the very same on-chain
  transaction as the charge — so either everyone gets paid at once, or the whole
  call fails. There's no in-between state."

### Scene 5 — Takeaway (2:05–2:30)

- 🎙️ "So you can encode every recipient, every percentage, and every fee path of a
  real-world payment in one YAML block, with no payment processor sitting in the
  middle. And if you reference a recipient that doesn't exist, it fails when the
  spec loads — not later, in the middle of a live request. Pay.sh makes splitting payments very convenient."

### Description bullets

- 🪙 Named `recipients:` block — wallet aliases used in `splits:`
- 💴 Fixed-amount or percentage splits, or mixed
- 🎯 Dynamic recipients via `${ENV_VAR}` substitution
- 📊 Per-tier split overrides when tiers differ

### Accuracy notes

- **Verified shape:** `recipients:` is a top-level map; `splits:` lives **inside**
  `metering:`; each split uses one of `amount` or `percent` and a `recipient`
  name. See `splits.yml`.
- Keep total splits below the per-unit price so the operator nets positive.
