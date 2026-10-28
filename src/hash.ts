import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";

// argon2id: slow by design, with a random salt built into every hash.
export async function hashPassword(pw: string): Promise<string> {
  return argonHash(pw);
}
export async function verifyPassword(hash: string, pw: string): Promise<boolean> {
  try { return await argonVerify(hash, pw); } catch { return false; }
}

// A real argon2 hash of nothing useful. We verify against it when the email is
// unknown, so a missing user costs the same time as a wrong password.
export const DUMMY_HASH = "$argon2id$v=19$m=19456,t=2,p=1$tHCUFOlE8DphUTffTKvYrg$YFTrUXq9K88SKmoBWZ3zEiZ59/hmhcCAHXDFFPbqU0c";
