import { app } from "./app";

// Entry khusus deploy Vercel: app Hono polos tanpa listen server.
// Di-bundle oleh `npm run build:api` menjadi api/index.js.
// (Pakai export default langsung agar sesuai gaya server/boot.ts.)
export default app;
