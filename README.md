# Lockbox

**A login system built from scratch, then hacked four ways and fixed each time.**
Built on camera in **Hackbig Builder Sessions, episode 2**: plan it, build it like a
tutorial would, break it, and fix it — so you can see *why* each defence exists.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/hackbighq/lockbox?quickstart=1)

- **Watch the build:** Hackbig on YouTube, Builder Sessions ep 2 (AI voice of Shiv, cloned, English).
- **Read before you run the attacks:** [SECURITY.md](SECURITY.md) — only ever attack your own copy on `localhost`.

## What it is

A tiny notes app whose only real job is to protect a login: sign up, log in, see only
your own notes, log out. About 300 lines of TypeScript. The notes exist to give the
login something worth guarding.

Stack: TypeScript, [Hono](https://hono.dev) on Node 22, `node:sqlite`
(`--experimental-sqlite`), [@node-rs/argon2](https://github.com/napi-rs/node-rs), Vitest.

## The four hacks, and the fix for each

We first build **v0** the way a thousand tutorials do — and it works perfectly, which is
exactly what makes it dangerous. Then, one chapter at a time:

| # | The weakness in v0 | The fix |
|---|---|---|
| 1 | Leaked database: passwords stored as unsalted SHA-256 crack instantly | argon2id with a per-hash salt |
| 2 | User enumeration: the login reveals which emails exist | one generic error + a dummy verify |
| 3 | Brute force: the login lets you guess forever | rate limit, 5 tries / 15 min per email+IP, then 429 |
| 4 | Stolen cookie: a copied cookie still works after logout | server-side sessions — delete the row on logout, expiry, rotate on login |

argon2 is honest about its limits: against the fixed build a top-100 password like the two
weak demo accounts' still falls — it just crawls instead of cracking in bulk — which is
*why* rate limiting and password length matter too. The long random demo password never cracks.

## Run it

**In Codespaces (no setup):** click the badge. It installs everything and seeds a local
database; the preview opens on port 8787. Uses your own free GitHub Codespaces hours.

**On your machine** (Node 22+):

```bash
git clone https://github.com/hackbighq/lockbox && cd lockbox
npm ci
npm run seed       # create and seed a local SQLite database (data.db)
npm run dev        # serve http://localhost:8787
npm test           # the four attacks, run as tests (red on v0, green after the fixes)
npm run typecheck  # TypeScript
```

Everything runs locally on your machine. There is no server to deploy and no account to create.

## Follow along: one tag per chapter

Each chapter of the video is a git tag, so you can check out the exact state at any point:

```bash
git checkout ch3-v0       # the working-but-insecure version — start the attacks here
git checkout ch4-hashing  # after fix 1 (argon2id)
git checkout ch5-enum     # after fix 2 (no user enumeration)
git checkout ch6-ratelimit# after fix 3 (rate limiting)
git checkout ch7-sessions # after fix 4 (server-side sessions)
git checkout ch8-tests    # the attacks turned into a test suite
```

## The attacks

In `attacks/`, each one breaks a specific weakness in your local copy:

- `crack.ts` — offline crack of a stolen users table against a common-password list
- `enum.ts` — asks the login which emails exist
- `brute.ts` — guesses one account's password until it's locked out
- `replay.sh` — logs in, copies the cookie, logs out, and replays the old cookie

Read [SECURITY.md](SECURITY.md) first. These point at `http://localhost:8787` by default
and must only be used against your own copy.

## Code map

```
src/server.ts    Hono routes: signup, login, logout, me, notes
src/db.ts        schema + the SQLite connection
src/hash.ts      password hashing (sha256 in v0 -> argon2id)
src/session.ts   cookie tokens; the DB stores only sha256(token)
src/limit.ts     login rate limiting
src/page.ts      the single HTML page
src/seed.ts      the three invented demo accounts
attacks/         the four attacks
test/            the attacks as a Vitest suite
```

## Bugs we hit on camera

- `vitest` can't resolve Node 22's `node:sqlite` builtin — a small `vitest.config.ts` plugin
  loads it via `createRequire` at test time, keeping `src/db.ts` clean.
- `nvim` opened outside the repo, so a relative `:w` threw `E212` — fixed live with `:cd`.

Built with AI assistance in a sandbox VM. MIT licensed — see [LICENSE](LICENSE).
