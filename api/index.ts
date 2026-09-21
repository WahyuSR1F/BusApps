import { handle } from "hono/vercel";
import { app } from "../server/app";

// Single Serverless Function untuk semua request API.
// Semua route /api/* diarahkan ke sini lewat rewrite di vercel.json.
export default handle(app);

export const config = {
  runtime: "nodejs20.x",
};
