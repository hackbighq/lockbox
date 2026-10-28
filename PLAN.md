# Lockbox: a login from scratch, then we hack it

## 1. The app (one user story)
Each user signs up, logs in, and sees only their own notes.
The notes exist to give the login something to protect.

## 2. One page
Signup, login, your notes, logout. No framework on the client.

## 3. Data
users(id, email UNIQUE, pw_hash, created_at)
sessions(id_hash PRIMARY KEY, user_id, expires_at)   -- cookie = random token; DB stores only sha256(token)
login_attempts(key, count, window_start)             -- backs rate limiting
notes(id, user_id, body)

## 4. API
POST /api/signup   POST /api/login   POST /api/logout   GET /api/me   GET/POST /api/notes

## 5. The threats we plan for
- leaked DB:        someone steals the users table
- user enumeration: the login tells you which emails exist
- brute force:      the login lets you try passwords forever
- stolen cookie:    a copied cookie still works after logout

## 6. Build v0 like a tutorial (on purpose), then hack and fix each
1. leaked DB        unsalted sha256  -> argon2id with a per-hash salt
2. enumeration      "no such user"   -> one generic message + dummy verify
3. brute force      no limit         -> 5 tries / 15 min per email+IP -> 429
4. stolen cookie    cleared only in  -> server-side sessions: delete the row on
                    the browser          logout, expiry, rotate on login

## 7. Out of scope for v1
OAuth / social login, email verification, password reset, 2FA, CSRF tokens
(SameSite=Lax covers our same-site forms), API keys.

## 8. Stack
TypeScript, Hono on Node, node:sqlite (--experimental-sqlite), @node-rs/argon2, Vitest.

## Note on runtime (recorded on camera)
node:sqlite and @node-rs/argon2 both run on Node 22.11 arm64 in the sandbox, so the
plan's stack stands unchanged. TS runs through tsx; the sqlite flag rides in NODE_OPTIONS.
