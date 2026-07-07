# Episode 6 — Pricing Endpoints: per call, tokens, tiers, variants

**Duration:** 2:30
**Companion doc:** <https://pay.sh/docs/building-with-pay/pricing>
**Code:** `code/episode-06-pricing/pricing.yml`

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "A real API usually has more than one price. Tokens cost differently from
  whole calls, output is often pricier than input, and high volume tends to earn a
  discount. The `metering` block lets you express all of that, and you don't write
  any code to do it."

### Scene 2 — Per-call (0:20–0:55)

- 🖥️ Open `pricing.yml`, scroll to `v1/search`.
- 🎙️ "Here's the simplest case. There's one dimension that measures usage, a scale
  of one, and a single tier priced at a penny — so that's just one cent per call."
- ⌨️ You run:

```sh
pay --sandbox server start pricing.yml
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/search -d '{"q":"test"}'
```

### Scene 3 — Token pricing (0:55–1:35)

- 🖥️ Scroll to `v1/generate`.
- 🎙️ "This one bills the way an LLM API does, with separate dimensions for input
  and output. A scale of one million means the price covers a million tokens, so
  here it's fifty cents per million tokens in, and a dollar fifty per million out."

### Scene 4 — Volume tiers + variants (1:35–2:10)

- 🖥️ Scroll to `v1/enrich` (tiers) and `v1/models/{model}:infer` (variants).
- ⌨️ You run:

```sh
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/pro:infer
pay --sandbox curl -X POST http://127.0.0.1:1402/v1/models/fast:infer
```

- 🎙️ "With volume tiers, the first tier that matches is the one that applies, and
  the last tier leaves off the `up_to` value so it covers everything above the
  others. And variants let the model in the URL path — `pro` versus `fast` — decide
  which price you pay: ten cents for pro, one cent for fast."

### Scene 5 — Takeaway (2:10–2:30)

- 🎙️ "So you can price any endpoint however it makes sense — per call, per token,
  per page, per byte. There's one rule to remember: the price divided by the scale
  has to stay above a millionth of a dollar, because stablecoins only have six
  decimal places. Go below that and validation will fail. Now lets see if we can also make this work for subscriptions."

### Description bullets

- 💰 `unit: requests` for simple per-call pricing
- 🧮 `direction: input` / `output` for LLM-style billing
- 📈 `tiers:` with `up_to` for volume discounts
- 🎚️ `variants:` for per-model pricing

### Accuracy notes

- **Corrected schema:** metering is `metering.dimensions[]` with
  `direction`/`unit`/`scale`/`tiers`. The planning doc's flat `unit: requests`
  shape is wrong — see `pricing.yml` for the verified shape.
- **Variants are path-only:** the gateway reads the variant from the URL path,
  and only from the segment right after a literal `models/` or `voices/`. A body
  field like `{"model":"pro"}` is ignored, so the endpoint must be shaped
  `v1/models/{model}:infer` and called as `/v1/models/pro:infer`. With a body
  param the call silently falls back to the first variant ($0.01), which is why
  pro and fast both billed a penny in the earlier draft.
- `accounting: per_agent` advances volume tiers per caller; `pooled` is the
  default shared counter.
