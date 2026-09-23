import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { getDb } from "./queries/connection";
import { Paths } from "../contracts/constants";

export const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    // Log error server-side agar penyebab 500 terlihat di Runtime Logs Vercel.
    onError({ error, path, type }) {
      console.error(`[tRPC] ${type} ${path} failed:`, error);
    },
  });
});

// Endpoint untuk verifikasi cepat: env var, konektivitas DB, dan status migrasi.
app.get("/api/health", async (c) => {
  const checks: Record<string, unknown> = {
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
  };
  let dbOk = false;
  try {
    const db = getDb();
    const result = await db.run("SELECT name FROM sqlite_master WHERE type='table' AND name='schedules' LIMIT 1");
    dbOk = true;
    checks.schedulesTable = result.rows.length > 0 ? "ok" : "missing (migrate belum jalan)";
  } catch (error) {
    checks.dbError = error instanceof Error ? error.message : String(error);
  }
  checks.db = dbOk ? "ok" : "fail";
  return c.json(checks, dbOk ? 200 : 503);
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
