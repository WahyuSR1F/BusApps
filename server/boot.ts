import { app } from "./app";
import { serveStaticFiles } from "./lib/vite";

// Default export dipakai @hono/vite-dev-server saat development.
export default app;

// Entry untuk `npm start` (Node.js production). Deploy ke Vercel
// memakai Serverless Function di api/index.ts, bukan file ini.
if (process.env.NODE_ENV === "production") {
  serveStaticFiles(app);

  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
