import { createHash } from "node:crypto";
import type { DB } from "./db";

// v0: a stateless signed token. The DB never learns the session exists,
// so logout can only clear the cookie in the browser, not kill the session.
const SECRET = "dev-secret-change-me";
const sign = (body: string) => createHash("sha256").update(body + SECRET).digest("hex").slice(0, 16);

export function mintSession(_db: DB, userId: number): string {
  const body = String(userId);
  return body + "." + sign(body);
}
export function readSession(_db: DB, token?: string): number | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  return sig === sign(body) ? Number(body) : null;
}
export function dropSession(_db: DB, _token?: string): void {
  // v0: nothing is stored server-side, so there is nothing to delete.
}
