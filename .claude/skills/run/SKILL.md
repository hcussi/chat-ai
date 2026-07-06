---
name: run
description: Launch and drive the Chat AI Next.js app (dev server + browser smoke test). Use when asked to run, start, or screenshot the app, or to confirm a change works in the real app.
---

# Running Chat AI

Next.js 15 (App Router) chat UI backed by the Google Gemini API. This skill launches the dev server and drives it end-to-end (prompt in, AI reply + token stats out).

## Critical: use Node 20

The app **500s on Node 21+** (including Node 25) with `localStorage.getItem is not a function`. `app/page.tsx` reads `localStorage`, and newer Node exposes a broken global `localStorage` stub during SSR; on Node 20 there is no server-side `localStorage`, so the client-only `useEffect` path works. The shell may default to a newer Node, so switch first:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm use 20.11.1   # any 20.x; matches .nvmrc
node -v           # confirm v20.x before launching
```

## Prerequisites

`.env.local` must exist with both vars (the API route reads them per-request, so a missing value fails only when you send a prompt, not at startup):

```
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

## Launch

Run the dev server in the background (it does not exit):

```bash
npm run dev
```

The app defaults to **port 3000**. If 3000 is already taken, use another port such as **3001** — Next auto-falls-back to the next free port and prints it, but you can also pin one explicitly:

```bash
npm run dev -- -p 3001   # force a specific port when 3000 is busy
```

Never assume the port: read the launch log for the actual URL and wait for `Ready in` before hitting it:

```bash
# after starting in background, block until ready, then grab the port it chose
until grep -qE "Ready in|error" <dev-log>; do sleep 0.5; done
grep -oE "localhost:[0-9]+" <dev-log> | head -1   # e.g. localhost:3001
```

Use whatever port the log reports (3001, 3002, ...) in all the smoke-test URLs below.

## Drive it (don't just launch it)

Smoke-test both surfaces:

```bash
# Page renders (200, not 500 — 500 means wrong Node version)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/

# Real Gemini round-trip
curl -s -X POST http://localhost:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Say hi in 3 words","history":[]}'
# -> {"text":"...","model":"gemini-2.5-flash","usage":{...},"time":...}
```

Then drive the UI in a browser (Playwright MCP) to confirm the full flow:

1. `browser_navigate` to `http://localhost:3001/`.
2. `browser_snapshot`, type a prompt into the "Enter your prompt..." textbox, submit with Enter.
3. `browser_snapshot` / `browser_take_screenshot` and **look at it** — you should see the user turn, the AI reply, and the right-hand Status panel populated (model, time, input/output/total tokens). A blank frame or missing stats = failure.

## Notes

- No database or auth; all chat state is in browser `localStorage`.
- Errors from the API surface as an assistant turn in the transcript rather than a thrown error.
