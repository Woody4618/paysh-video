# Episode 7 — Recurring Revenue with Subscriptions

**Duration:** 3:00
**Companion doc:** <https://pay.sh/docs/building-with-pay/subscriptions/concept>
**YAML spec:** <https://pay.sh/docs/building-with-pay/subscriptions/yaml-specification>
**Code:** `code/episode-07-subscriptions/subscription.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "If your product bills monthly, charging for every single call is just
  friction. A `subscription` block replaces that pay-every-time loop with a single
  commitment the customer signs once, and then the server pulls each renewal
  on-chain on its own schedule."

### Scene 2 — The block (0:20–0:50)

- 🖥️ Open `subscription.yml`, show the `subscription:` block: `period: 30d`,
  `price_usd: 9.99`, `currency: USDC`.

### Scene 3 — Publish the plan / Terminal A (0:50–1:40)

- ⌨️ You run:

```sh
pay --sandbox server start subscription.yml
```

- 🎙️ "The first time I launch this, pay derives the on-chain plan account and asks
  me to publish it — and on sandbox the rent is covered for me. I say yes, and pay
  writes the plan ID back into the YAML file. Make sure you commit that, because
  it's part of your provider's contract with subscribers."

### Scene 4 — Subscribe / Terminal B (1:40–2:25)

- ⌨️ You run:

```sh
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
pay --sandbox curl http://127.0.0.1:1402/api/v1/pro/feed
```

- 🎙️ "On the first request I get a 402 with a subscription intent, and Touch ID
  approves both the $9.99 charge and the recurring delegation in a single step. On
  the second request, within the same period, there's no prompt at all — I just
  get the response."

### Scene 5 — Subscriber side (2:25–2:45)

- ⌨️ You run:

```sh
pay subscriptions list
```

- 🎙️ "The subscription is tracked locally with its schedule, the recipient, the
  amount, and its on-chain account. And if you want to inspect or cancel one, the
  `status` and `cancel` commands take that same ID."

### Scene 6 — Takeaway (2:45–3:00)

- 🎙️ "So that's recurring revenue with no card vault, no billing processor, and no
  monthly invoice run. Use a subscription when you're selling access over time —
  and if the value changes from call to call, stick with metering instead."

### Description bullets

- 🔄 `subscription:` — `period: 30d`, `price_usd: 9.99`, `currency: USDC`
- 🪪 On-chain Plan PDA published once, reused forever
- ✍️ One-signature activation; renewals are server-driven
- 🚫 Cancellation honored to end of paid period

### Accuracy notes

- **Verified:** `period: month`/`1m`/`1y` are rejected. Mapped interval must be
  in `[1h, 8760h]`. Use `30d`, `2w`, `52w`.
- **Verified:** subscriber-side commands are `pay subscriptions list / status /
cancel / refresh` (plural `subscriptions`).
- `subscription:` and `metering:` are mutually exclusive on one endpoint.
