import { TRPCError } from "@trpc/server";

// Cloudflare test secret keys:
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TEST_SECRET_ALWAYS_PASS = "1x0000000000000000000000000000000AA";

// Token dummy yang dikirim bersama test site key "selalu lolos".
const DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Verifikasi token Cloudflare Turnstile (server-side siteverify).
 *
 * Mode:
 * - TURNSTILE_SECRET_KEY terisi  -> verifikasi asli via Cloudflare.
 * - VITE_FORCE_TURNSTILE_FAIL=1 -> selalu gagal (untuk uji error path).
 * - default (tanpa secret)      -> test key "selalu lolos" agar alur
 *   login/register tetap berfungsi sebelum Turnstile dikonfigurasi.
 */
export async function verifyTurnstileToken(
  token?: string,
): Promise<void> {
  // Mode "selalu gagal" untuk pengujian error path.
  if (process.env.VITE_FORCE_TURNSTILE_FAIL === "1") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.",
    });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Belum dikonfigurasi -> mode uji dengan test secret (selalu lolos).
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY belum diisi — verifikasi dilewati (mode uji).",
      );
    }
    return;
  }

  // Konfigurasi asli: token wajib ada.
  if (!token) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Verifikasi keamanan belum selesai. Muat ulang halaman dan coba lagi.",
    });
  }

  // Sinkron dengan test site key "selalu lolos" di sisi klien.
  if (secret === TEST_SECRET_ALWAYS_PASS && token === DUMMY_TOKEN) {
    return;
  }

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );

  if (!resp.ok) {
    console.error("[turnstile] siteverify HTTP error:", resp.status);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Verifikasi keamanan gagal. Coba lagi.",
    });
  }

  const result = (await resp.json()) as SiteverifyResponse;
  if (!result.success) {
    console.warn(
      "[turnstile] verifikasi gagal:",
      result["error-codes"]?.join(", "),
    );
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.",
    });
  }
}
