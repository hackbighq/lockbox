import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { DB } from "./db";
import { page } from "./page";
import { hashPassword, verifyPassword, DUMMY_HASH } from "./hash";
import { mintSession, readSession, dropSession } from "./session";

type User = { id: number; email: string; pw_hash: string };

export function makeApp(db: DB) {
  const app = new Hono();
  app.get("/", c => c.html(page));

  const me = (c: any): number | null => readSession(db, getCookie(c, "sid"));

  app.post("/api/signup", async c => {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "email and password needed" }, 400);
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) return c.json({ error: "email already registered" }, 409);
    const info = db.prepare("INSERT INTO users (email, pw_hash) VALUES (?, ?)")
      .run(email, await hashPassword(password));
    setCookie(c, "sid", mintSession(db, Number(info.lastInsertRowid)), { httpOnly: true, sameSite: "Lax", path: "/" });
    return c.json({ ok: true });
  });

  app.post("/api/login", async c => {
    const { email, password } = await c.req.json();
    const u = db.prepare("SELECT id, email, pw_hash FROM users WHERE email = ?").get(email) as User | undefined;
    const ok = await verifyPassword(u ? u.pw_hash : DUMMY_HASH, password);
    if (!u || !ok) return c.json({ error: "invalid email or password" }, 401);
    setCookie(c, "sid", mintSession(db, u.id), { httpOnly: true, sameSite: "Lax", path: "/" });
    return c.json({ ok: true });
  });

  app.post("/api/logout", c => {
    dropSession(db, getCookie(c, "sid"));
    deleteCookie(c, "sid", { path: "/" });
    return c.json({ ok: true });
  });

  app.get("/api/me", c => {
    const uid = me(c);
    if (!uid) return c.json({ error: "not logged in" }, 401);
    const u = db.prepare("SELECT id, email FROM users WHERE id = ?").get(uid);
    return c.json({ user: u });
  });

  app.get("/api/notes", c => {
    const uid = me(c);
    if (!uid) return c.json({ error: "not logged in" }, 401);
    const notes = db.prepare("SELECT id, body FROM notes WHERE user_id = ? ORDER BY id DESC").all(uid);
    return c.json({ notes });
  });

  app.post("/api/notes", async c => {
    const uid = me(c);
    if (!uid) return c.json({ error: "not logged in" }, 401);
    const { body } = await c.req.json();
    if (!body) return c.json({ error: "body needed" }, 400);
    db.prepare("INSERT INTO notes (user_id, body) VALUES (?, ?)").run(uid, body);
    return c.json({ ok: true });
  });

  return app;
}
