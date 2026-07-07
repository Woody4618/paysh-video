# Episode 9 — Managing Your pay Accounts

**Duration:** 3:30
**Companion doc:** <https://pay.sh/docs/using-pay/manage-accounts>
**CLI reference:** <https://pay.sh/docs/toolchain/commands/accounts>

### Scene 1 — Cold open (0:00–0:20)

- 🎙️ "So in the last episodes we were always using the same wallet. And one wallet is fine right up until it isn't. Eventually you want a personal account for paying, a separate operator account for receiving, a way to move
  stablecoins between them, and a backup — because the OS keychain is convenient,
  but it doesn't sync across machines."

### Scene 2 — What you've got (0:20–0:50)

- ⌨️ You run:

```sh
pay whoami
pay account list
```

- 🎙️ "`whoami` tells me which mainnet account is active right now, and
  `account list` widens that out to show every account across every network,
  along with its balance."

### Scene 3 — Add + switch (0:50–1:30)

- ⌨️ You run:

```sh
pay account new work

```

- 🎙️ "When I create an account, the secret goes straight into the OS keystore, and
  only the public key gets written to `accounts.yml`. Then `default work` makes
  that new account the active one."

### Scene 4 — Move stablecoins (1:30–2:15)

- ⌨️ You run:

```sh
pay send 0.01 work --currency USDC
pay account default work
pay whoami
```

- 🎙️ "Here I'm pushing 10 USDC from my original account over to `work`. Because
  it's fee-payer–backed, no SOL ever leaves the sender — the pay API co-signs the
  transaction for me. And the receipt shows me the amount, the fee, and a link to
  the explorer."

### Scene 5 — Back up before you fund (2:15–2:55)

- ⌨️ You run:

```sh
pay account export work ./work-backup.json
rm -P ./work-backup.json   # after moving it to 1Password / encrypted USB
```

- 🎙️ "Exporting is your entire backup story, and it matters because the keystore
  doesn't sync through iCloud. If you never export and the machine dies, those
  funds are gone for good."

### Scene 7 — Takeaway (3:20–3:30)

- 🎙️ "So that's multiple accounts living on one machine, stablecoins moved
  between them with a single command, and any of them recovered on a brand-new
  machine — all without ever touching the solana CLI or writing down a seed
  phrase."

### Description bullets

- 📇 `pay whoami` / `pay account list`
- ✨ `pay account new <name>`
- 🎯 `pay account default <name>` / global `--account <name>`
- 💸 `pay push <amount> <target>` — fee-payer–backed USDC transfer
- 📦 `pay account export` / ♻️ `pay account import`

### Accuracy notes

- **Corrected ordering:** `--account` is a **global** flag — it goes _before_ the
  subcommand: `pay --account work whoami` (not `pay whoami --account work`).
- **Corrected flag:** removing a non-mainnet account needs the network qualifier:
  `pay account remove work --sandbox --yes`.
- `pay push` and `pay send` are aliases. `pay push max <target>` drains and
  auto-implies `--fee-within`.
- macOS keychain peek: `security find-generic-password -s "pay.sh" -a "keypair:work" -w`.
