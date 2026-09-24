import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

// Cloudflare test keys (selalu lolos / selalu gagal) — dipakai saat env
// Turnstile belum diisi agar alur login bisa dites tanpa konfigurasi.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TEST_SITE_KEY_PASS = "1x00000000000000000000AA"; // selalu lolos
const TEST_SITE_KEY_BLOCK = "2x00000000000000000000AB"; // selalu gagal

export const TEST_TURNSTILE_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

/**
 * Kembalikan konfigurasi Turnstile berdasarkan env yang tersedia.
 * - VITE_TURNSTILE_SITE_KEY terisi  -> production (Cloudflare asli)
 * - VITE_FORCE_TURNSTILE_FAIL=1     -> mode gagal (untuk uji error path)
 * - default                          -> test key yang selalu lolos
 */
export function getTurnstileConfig() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const forceFail = import.meta.env.VITE_FORCE_TURNSTILE_FAIL === "1";
  return {
    siteKey: forceFail ? TEST_SITE_KEY_BLOCK : siteKey || TEST_SITE_KEY_PASS,
    isTestMode: !siteKey || forceFail,
  };
}

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export default function TurnstileWidget({
  onToken,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const ref = useRef<TurnstileInstance>(null);
  const { siteKey } = getTurnstileConfig();

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={onExpire}
        onError={onError}
        options={{ theme: "light", size: "flexible" }}
      />
    </div>
  );
}
