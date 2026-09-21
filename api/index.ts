import { handle } from "hono/vercel";
import { app } from "../server/app";

// Single Serverless Function untuk semua request API.
// Semua route /api/* diarahkan ke sini lewat rewrite di vercel.json.

export default handle(app);

// `runtime` yang valid hanya: "edge" | "experimental-edge" | "nodejs".
// Kita pakai default serverless Node.js, jadi config ini boleh dihapus
// seluruhnya — dibiarkan sebagai dokumentasi eksplisit.
export const config = {
  runtime: "nodejs",
};
