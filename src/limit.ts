import type { DB } from "./db";

// 5 wrong tries per email+IP in a 15 minute window, then 429.
const LIMIT = 5, WINDOW = 15 * 60 * 1000;

export function rateLimited(db: DB, email: string, ip: string): boolean {
  const row = db.prepare("SELECT count, window_start FROM login_attempts WHERE key = ?").get(`${email}|${ip}`) as any;
  return !!row && Date.now() - row.window_start < WINDOW && row.count >= LIMIT;
}
export function noteAttempt(db: DB, email: string, ip: string): void {
  const key = `${email}|${ip}`;
  const row = db.prepare("SELECT count, window_start FROM login_attempts WHERE key = ?").get(key) as any;
  if (!row || Date.now() - row.window_start >= WINDOW) {
    db.prepare("INSERT OR REPLACE INTO login_attempts (key, count, window_start) VALUES (?, 1, ?)").run(key, Date.now());
  } else {
    db.prepare("UPDATE login_attempts SET count = count + 1 WHERE key = ?").run(key);
  }
}
export function clearAttempts(db: DB, email: string, ip: string): void {
  db.prepare("DELETE FROM login_attempts WHERE key = ?").run(`${email}|${ip}`);
}
