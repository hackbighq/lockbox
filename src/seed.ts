import { openDb } from "./db";
import { hashPassword } from "./hash";

// Three invented demo accounts. Two use weak passwords that sit near the top of
// the common-password list; neha's is long and random and never appears in it.
const DEMO: [string, string][] = [
  ["asha@lockbox.app", "123456"],
  ["ravi@lockbox.app", "iloveyou"],
  ["neha@lockbox.app", "T9x!qR4m#Lw2vZ"],
];

const db = openDb(process.env.LOCKBOX_DB ?? "data.db");
db.exec("DELETE FROM notes; DELETE FROM users;");
for (const [email, pw] of DEMO) {
  const info = db.prepare("INSERT INTO users (email, pw_hash) VALUES (?, ?)").run(email, await hashPassword(pw));
  db.prepare("INSERT INTO notes (user_id, body) VALUES (?, ?)").run(info.lastInsertRowid, `${email.split("@")[0]}'s private note`);
}
console.log("seeded", DEMO.length, "users");
