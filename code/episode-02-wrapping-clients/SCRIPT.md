# Episode 2 — Wrapping curl, wget, http, and fetch

**Duration:** 2:00
**Companion doc:** <https://pay.sh/docs/using-pay/pass-through-commands>

### Scene 1 — Cold open (0:00–0:15)

- 🎙️ "Pay doesn't replace the tools you already use — it wraps them. Whatever
  HTTP client you reach for, pay runs in front of it, catches the 402, signs the
  payment, and retries the request. The URL, the headers, and the body all stay
  exactly the same."

### Scene 2 — Same curl, with and without (0:15–0:50)

- 🖥️ Split view: plain curl (402) on top, `pay --sandbox curl` (200) below.
- ⌨️ You run:

```sh
pay --sandbox curl https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 3 — wget and http (0:50–1:20)

- ⌨️ You run:

```sh
pay --sandbox http GET https://debugger.pay.sh/mpp/quote/AAPL
pay --sandbox wget -qO- https://debugger.pay.sh/mpp/quote/AAPL
```

- 🎙️ "Everything you type after `curl` or `wget` or "http" gets forwarded to curl exactly as written,
  so you don't have to escape anything differently just because pay is in front."

- 🎙️ "Same paid endpoint, three different clients. HTTPie pretty-prints the headers
  and the JSON for you, and for wget the only difference is the `-qO-` flag —
  that's wget's own flag for printing the body to the terminal instead of saving
  it to a file. Pay forwards it straight through, which is exactly the point: pay
  never touches your tool's flags, it just handles the payment around them."

### Scene 4 — Built-in fetch (1:20–1:45)

- 🎙️ "And if you don't have curl on the machine at all, pay has its own HTTP
  client built in. Just use `pay fetch` and there's no external dependency to
  install."
- ⌨️ You run:

```sh
pay --sandbox fetch https://debugger.pay.sh/mpp/quote/AAPL
```

### Scene 5 — Takeaway (1:45–2:00)

- 🎙️ "So you can drop pay in front of almost any workflow that speaks HTTP without
  rewriting any of it. Before we put pay in front of our claude agent, lets have a look what services are available in the catalogue and how to discover them. "

### Description bullets

- 🌀 `pay curl`, `pay wget`, `pay http` — pass-through HTTP clients
- 🚀 `pay fetch` — built-in client, no external dependency
- 🧰 Keep all your existing flags, headers, and bodies
- 🤖 Same model powers `pay claude` / `pay codex` (Episode 4)

### Accuracy notes

- The pass-through list is: `curl`, `wget`, `http`, `claude`, `codex`, `whoami`.
- **`http` = HTTPie, a separate install (verified 2026-06-25):** pass-through just
  shells out to the named binary, so `pay http …` fails with
  `Command not found: http` unless HTTPie is on `PATH`. Install it first with
  `brew install httpie` (provides `/opt/homebrew/bin/http`). On a clean machine,
  pre-install before recording or cut the `http` beat. `curl` and `wget` ship with
  macOS; `http` does not.
- **Don't use `/mpp/echo` (verified 2026-06-25):** that endpoint returns
  `403 PERMISSION_DENIED — Missing API key or access token`, not a clean paid 200.
  The reliable demo endpoint is `GET /mpp/quote/AAPL`, which returns
  `{"symbol":"AAPL","price":"…","source":"mpp-demo"}`. Use it for all three clients.
- **wget needs `-qO-` on camera (verified 2026-06-25):** bare `pay --sandbox wget
<url>` succeeds (200 + `Payment-Receipt` header), but wget's _default_ is to save
  the body to a file (e.g. `AAPL`, then `AAPL.1` on re-run) rather than print it —
  so the terminal shows a download log, not the quote. `-q` silences the log and
  `-O-` writes the body to stdout, making it read like curl. This is not a pay bug;
  pay forwards the flags verbatim. Good moment to reinforce the pass-through point.
- `pay fetch` is **not** a pass-through — it's pay's own HTTP client. Keep that
  distinction; the planning doc's "pay fetch when a tool isn't in the list" framing
  is correct.
- Moved the `pay claude` beat out of this episode into Episode 4 to avoid
  overlap; this episode is now purely HTTP clients (tighter at 2:00).
