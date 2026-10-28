import { createHash, randomBytes } from "node:crypto";
import type { DB } from "./db";

// Server-side sessions: the cookie is a random token; the DB holds only sha256(token).
// Logout deletes the row, so a copied cookie dies the moment you log out.
const DAY = 24 * 60 * 60 * 1000;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export function mintSession(db: DB, userId: number): string {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(sha(token), userId, Date.now() + 7 * DAY);
  return token;
}
export function readSession(db: DB, token?: string): number | null {
  if (!token) return null;
  const row = db.prepare("SELECT user_id, expires_at FROM sessions WHERE id_hash = ?").get(sha(token)) as any;
  if (!row || row.expires_at < Date.now()) return null;
  return row.user_id;
}
export function dropSession(db: DB, token?: string): void {
  if (token) db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(sha(token));
}
