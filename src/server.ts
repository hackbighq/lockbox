import { serve } from "@hono/node-server";
import { openDb } from "./db";
import { makeApp } from "./index";

const db = openDb(process.env.LOCKBOX_DB ?? "data.db");
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: makeApp(db).fetch, port }, info => {
  console.log(`Lockbox on http://localhost:${info.port}`);
});
