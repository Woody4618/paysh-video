# Episode 3 — Discovering Paid APIs in the Catalog

**Duration:** 3:00 (was 2:30 — added the real mainnet paid call + audio playback)
**Companion doc:** <https://pay.sh/docs/pay-for-apis/discover-providers>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/agents>

### Scene 1 — Cold open (0:00–0:15)

- 🎙️ "There's an open catalog of HTTP-gated APIs that are ready to call. You
  search it, pick a provider, list its endpoints, and pay your way in."

### Scene 2 — Search (0:15–1:00)

- 🖥️ Lower-third: `pay skills search "<task>"`
- ⌨️ You run:

```sh
pay skills search "google"
```

- 🎙️ "I like to search by the task I'm trying to do, rather than by a provider
  name. In this case one of the results is Google Cloud Text-to-Speech, running
  behind a pay gateway."

### Scene 3 — Inspect endpoints (1:00–1:45)

- 🎙️ "Once I've picked a service, I can list its endpoints to see the methods,
  the paths, and the live price. This one has a `voices` resource that's free, and
  a `text` resource that's the paid one that synthesizes speech."
- ⌨️ You run:

```sh
pay skills endpoints solana-foundation/google/texttospeech voices
pay skills endpoints solana-foundation/google/texttospeech text
```

- 🖥️ The on-camera output shows the real endpoint(s) and current price — let the
  table speak rather than narrating a hardcoded number (prices can change). Note
  the resource tag is the second word after the service (`voices` / `text`), not
  a project ID.

### Scene 4 — Confirm the provider, free (1:45–2:05)

- 🎙️ "Before I pay anything, I'll hit two free endpoints to confirm I'm talking to
  the right gateway. The `openapi.json` is the gateway describing itself, and the
  `voices` endpoint lists what it can do — neither one costs a cent, so they run
  fine on the sandbox."
- ⌨️ You run:

```sh
# Gateway URL comes verbatim from the catalog entry above.
pay --sandbox curl https://texttospeech.google.gateway-402.com/openapi.json
pay --sandbox curl https://texttospeech.google.gateway-402.com/v1/voices
```

### Scene 5 — Make the real paid call (2:05–2:45)

- 🎙️ "Now the real thing. The synthesize endpoint is paid, and this gateway settles
  on mainnet — so I drop the sandbox flag and let it use my real wallet. Watch the
  Touch ID prompt: that's me approving a real, sub-penny stablecoin payment."
- 🖥️ Lower-third: `pay --mainnet curl … /v1/text:synthesize`
- ⌨️ You run:

```sh
pay --mainnet curl -X POST https://texttospeech.google.gateway-402.com/v1/text:synthesize \
  -H 'content-type: application/json' \
  -d '{
    "input": {"text": "Germany will win the world cup this year."},
    "voice": {"languageCode": "en-US", "ssmlGender": "NEUTRAL"},
    "audioConfig": {"audioEncoding": "MP3"}
  }'
```

- 🎙️ "So here we can see now that we get the Response back in base64. We could now go ahead and decode it and play it back. But I have a better idea. Lets use a claude agent to do all of that for us. Discover the service, pay for it, and play the audio back for us. "

### Description bullets

- 🔍 `pay skills search "<task>"` — fuzzy search the catalog
- 📑 `pay skills endpoints <service> <resource>` — endpoints + pricing
- 🗺️ Catalog is open-source at solana-foundation/pay-skills
- 🤝 Gateway URLs are stable — copy them straight into your code

### Accuracy notes

- **Corrected commands:** it's `pay skills search` and
  `pay skills endpoints <service> <resource>` — there is **no** `pay skills show`.
- **Corrected FQNs:** real catalog entries look like
  `solana-foundation/google/texttospeech`, `paysponge/coingecko`, `quicknode/rpc`,
  `birdeye/data` — **not** `google.maps/v1`. Browse live ones at
  <https://pay.sh/services>.
- **Resource tag gotcha (hit on 2026-06-25):** the `<resource>` arg is the tag pay
  groups a service's endpoints under (shown as `resource: <name>` in
  `pay skills search` output), **not** a Google project ID. For `texttospeech`
  the valid resources are `voices` and `text`. Running
  `pay skills endpoints solana-foundation/google/texttospeech projects` fails with
  `No endpoints found for resource projects` — `projects` is an empty OpenAPI tag
  with no endpoints attached. Always read the resource name off the search output.
- **The paid call is MAINNET-ONLY (verified 2026-06-26):** the Google gateways
  (texttospeech, language, speech, places, bigquery) only offer **mainnet** payment
  challenges. `pay --sandbox curl …` on a _paid_ endpoint fails with
  `No MPP challenge matched the active network filter (active: localnet, offered:
mainnet)`. Only the free endpoints (`/openapi.json`, `GET /v1/voices`) succeed on
  sandbox. So Scene 4 confirms the provider for free on sandbox, and Scene 5 does
  the real paid call on `--mainnet` (which also gives us the Touch ID moment).
- **Pricing + cost (verified 2026-06-26):** the decoded 402 reports
  `$30 per 1,000,000 characters`. The Scene 5 demo string is ~57 chars ≈ **$0.0017**
  — trivial. You need a funded mainnet account (the `auth_required: true`
  keychain account → Touch ID). Response is JSON with base64 `audioContent`; decode
  with the Python one-liner and play with `afplay` (macOS built-in).
- **Pinned demo (verified live 2026-06-25):** `solana-foundation/google/texttospeech`,
  gateway `https://texttospeech.google.gateway-402.com` (serves `/openapi.json`;
  resources `voices` = free `GET v1/voices`, `text` = paid `POST v1/text:synthesize`).
  Run `pay skills endpoints …` on camera to surface the current price rather than
  hardcoding it. **Note:** `solana-foundation/google/translate` was unpublished as
  of this date (`pay skills search` skips it with "no published endpoints
  available"), which is why the demo was re-pinned off it. Backup providers if
  texttospeech is down on the day: `solana-foundation/google/language` (resource
  `documents`), `solana-foundation/google/speech` (resource `speech`),
  `solana-foundation/google/places` (resource `places`).
