import { createHash } from "node:crypto";

// v0: unsalted sha256, the way too many tutorials do it.
export async function hashPassword(pw: string): Promise<string> {
  return createHash("sha256").update(pw).digest("hex");
}
export async function verifyPassword(hash: string, pw: string): Promise<boolean> {
  return createHash("sha256").update(pw).digest("hex") === hash;
}
