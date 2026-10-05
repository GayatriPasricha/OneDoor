# OneDoor

One front door to student support. A prototype: React front end, a small Node API for Gemini, and requests kept in the browser's `localStorage` (no database). Use fictional inputs only.

```bash
npm install
cp .env.example .env     # then set GEMINI_API_KEY=... in .env (needed for AI triage)
npm run dev              # site on :5173, API on :8787
```

Without `GEMINI_API_KEY` the app still works: it uses the built-in keyword triage.

## Demo inputs (fictional)

| Type this | Result |
|---|---|
| I'm overwhelmed, I can't sleep, and I'm falling behind on my assignments. | Student Wellbeing · Medium (academic mentioned) |
| I can't pay my fees this term. | Student Money Advice · Medium |
| My landlord says I have to leave tonight and I don't have anywhere else to stay. | Accommodation Services · High |
| I can't go on like this | Immediate support (crisis screen, no AI call) |

## How routing works

1. **Local safety check first.** `detectCrisis()` in `src/lib/keywordTriage.js` runs in the browser. A crisis goes straight to the immediate-support screen and is never sent to any AI. The server repeats the check and refuses (422).
2. **Gemini routes everything else.** The browser calls `POST /api/triage` on our own Node server (`server/`), which calls Gemini (`gemini-3.5-flash-lite` by default) with a JSON schema. The AI cannot trigger the crisis screen: the schema has no crisis field and the browser ignores it.
3. **Validation, then fallback.** `normalizeResult()` in `src/lib/analyse.js` checks every field. If Gemini is not configured, errors, times out (6s), or returns anything invalid, the keyword system in `keywordTriage.js` answers instead. Nothing is shown to the student.
4. **Consent** is enforced in `createRequest()` (`src/lib/storage.js`): the summary is only stored when the student says yes. Requests are kept in `localStorage`.

## Gemini setup

```bash
cp .env.example .env     # then put your key in .env:  GEMINI_API_KEY=...
npm run smoke            # live check against Gemini with made-up messages
npm run dev              # site (5173) + API (8787)
```

| Variable | Required | Default |
|---|---|---|
| `GEMINI_API_KEY` | for AI triage | none (keyword fallback is used) |
| `GEMINI_MODEL` | no | `gemini-3.5-flash-lite` |
| `PORT` | no | `8787` |

The key is read only by `server/`. It has no `VITE_` prefix, so it never reaches the browser bundle, and `.env` is git-ignored. Requests are sent with `store: false` and the server never logs student text. The free Gemini tier lets Google use content to improve its products, so use made-up messages with a free key, and a paid-tier key for real students.

`npm test` runs the server tests (Gemini is faked, no key needed). `npm run dev:web` runs the site alone with the keyword fallback.## How routing works

1. **Local safety check first.**  in  runs in the browser. A crisis goes straight to the immediate-support screen and is never sent to any AI. The server repeats the check and refuses (422).
2. **Gemini routes everything else.** The browser calls  on our own Node server (), which calls Gemini ( by default) with a JSON schema. The AI cannot trigger the crisis screen: the schema has no crisis field and the browser ignores it.
3. **Validation, then fallback.**  in  checks every field. If Gemini is not configured, errors, times out (6s), or returns anything invalid, the keyword system in  answers instead. Nothing is shown to the student.
4. **Consent** is enforced in  (): the summary is only stored when the student says yes. Requests are kept in .

## Gemini setup

\
> onedoor@0.1.0 smoke
> node --env-file-if-exists=.env server/smoke.js

FAIL "I'm so stressed and overwhelmed, I can't sleep and I'm behind on my assignments" → 404 This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements.
FAIL "I can't pay my fees this term" → 404 This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements.
FAIL "My hostel room has mould and the landlord won't respond" → 404 This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements.
FAIL ["money"] → 404 This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements.
FAIL "not sure who to talk to" → 404 This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features and improvements.

5 of 5 failed

> onedoor@0.1.0 dev
> concurrently -k -n web,api -c cyan,magenta "npm:dev:web" "npm:dev:api"

[web] 
[web] > onedoor@0.1.0 dev:web
[web] > vite
[web] 
[api] 
[api] > onedoor@0.1.0 dev:api
[api] > node --watch --env-file-if-exists=.env server/index.js
[api] 
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[web] Port 5173 is in use, trying another one...
[web] 
[web]   [32m[1mVITE[22m v5.4.21[39m  [2mready in [0m[1m468[22m[2m[0m ms[22m
[web] 
[web]   [32m➜[39m  [1mLocal[22m:   [36mhttp://localhost:[1m5174[22m/[39m
[web] [2m  [32m➜[39m  [1mNetwork[22m[2m: use [22m[1m--host[22m[2m to expose[22m
[api] Failed running 'server/index.js'. Waiting for file changes before restarting...
[api] Restarting 'server/index.js'
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[api] [triage] 200 1687ms
[api] [triage] 200 1520ms
[api] [triage] 200 1663ms
[api] [triage] 200 1523ms
[api] Restarting 'server/index.js'
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[api] Restarting 'server/index.js'
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[api] [triage] 200 2425ms
[api] [triage] 200 1759ms
[api] Restarting 'server/index.js'
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[api] Restarting 'server/index.js'
[api] node:events:497
[api]       throw er; // Unhandled 'error' event
[api]       ^
[api] 
[api] Error: listen EADDRINUSE: address already in use 127.0.0.1:8787
[api]     at Server.setupListenHandle [as _listen2] (node:net:1940:16)
[api]     at listenInCluster (node:net:1997:12)
[api]     at node:net:2206:7
[api]     at process.processTicksAndRejections (node:internal/process/task_queues:90:21)
[api] Emitted 'error' event on Server instance at:
[api]     at emitErrorNT (node:net:1976:8)
[api]     at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
[api]   code: 'EADDRINUSE',
[api]   errno: -4091,
[api]   syscall: 'listen',
[api]   address: '127.0.0.1',
[api]   port: 8787
[api] }
[api] 
[api] Node.js v22.19.0
[api] Failed running 'server/index.js'. Waiting for file changes before restarting...
[api] Restarting 'server/index.js'
[api] [triage] API on http://127.0.0.1:8787 — Gemini configured
[api] [triage] 400 2ms
[api] [triage] 200 1815ms
[api] [triage] 200 1127ms
[api] [triage] 200 3618ms
[api] [triage] 200 1348ms
[api] [triage] 200 1189ms
[api] [triage] 200 1096ms
[api] [triage] 200 1214ms
[api] [triage] 200 1534ms
| Variable | Required | Default |
|---|---|---|
|  | for AI triage | none (keyword fallback is used) |
|  | no |  |
|  | no |  |

The key is read only by . It has no  prefix, so it never reaches the browser bundle, and  is git-ignored. Requests are sent with  and the server never logs student text. The free Gemini tier lets Google use content to improve its products, so use made-up messages with a free key, and a paid-tier key for real students.

Unknown command: "test"


Did you mean this?
  npm test # Test a package
To see a list of supported npm commands, run:
  npm help runs the server tests (Gemini is faked, no key needed).  runs the site alone with the keyword fallback.
