import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { openDb } from "../src/db";
import { makeApp } from "../src/index";
import { hashPassword } from "../src/hash";

// A fresh in-memory app with one known account for each test.
async function fresh() {
  const db = openDb(":memory:");
  db.prepare("INSERT INTO users (email, pw_hash) VALUES (?, ?)").run("asha@lockbox.app", await hashPassword("123456"));
  return makeApp(db);
}
const login = (app: any, email: string, password: string) =>
  app.request("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });

describe("hack 1: leaked DB", () => {
  it("stores an argon2id hash, not the sha256 of the password", async () => {
    const db = openDb(":memory:");
    db.prepare("INSERT INTO users (email, pw_hash) VALUES (?, ?)").run("x@lockbox.app", await hashPassword("123456"));
    const hash = (db.prepare("SELECT pw_hash FROM users WHERE email = ?").get("x@lockbox.app") as any).pw_hash;
    expect(hash.startsWith("$argon2")).toBe(true);
    expect(hash).not.toBe(createHash("sha256").update("123456").digest("hex"));
  });
});

describe("hack 2: user enumeration", () => {
  it("answers the same for a real and a missing account", async () => {
    const app = await fresh();
    const real = await login(app, "asha@lockbox.app", "wrong");
    const missing = await login(app, "ghost@lockbox.app", "wrong");
    expect(real.status).toBe(missing.status);
    expect(await real.json()).toEqual(await missing.json());
  });
});

describe("hack 3: brute force", () => {
  it("blocks the account after 5 wrong tries", async () => {
    const app = await fresh();
    for (let i = 0; i < 5; i++) expect((await login(app, "asha@lockbox.app", "nope" + i)).status).toBe(401);
    expect((await login(app, "asha@lockbox.app", "nope")).status).toBe(429);
  });
});

describe("hack 4: stolen cookie after logout", () => {
  it("rejects the old cookie once you log out", async () => {
    const app = await fresh();
    const sid = (await login(app, "asha@lockbox.app", "123456")).headers.get("set-cookie")!.match(/sid=([^;]+)/)![1];
    expect((await app.request("/api/notes", { headers: { cookie: `sid=${sid}` } })).status).toBe(200);
    await app.request("/api/logout", { method: "POST", headers: { cookie: `sid=${sid}` } });
    expect((await app.request("/api/notes", { headers: { cookie: `sid=${sid}` } })).status).toBe(401);
  });
});
