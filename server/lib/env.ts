import { z } from "zod";

const envSchema = z.object({
  // Database (Turso / libSQL): libsql://... atau file:local.db
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Backend auth (Kimi OAuth)
  APP_ID: z.string().default(""),
  APP_SECRET: z.string().default(""),
  KIMI_AUTH_URL: z.string().default("https://auth.kimi.com"),
  KIMI_OPEN_URL: z.string().default("https://open.kimi.com"),

  // Admin role
  OWNER_UNION_ID: z.string().default(""),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  // Alias camelCase agar kompatibel dengan pemakaian di modul server
  databaseUrl: parsed.data.DATABASE_URL,
  appId: parsed.data.APP_ID,
  appSecret: parsed.data.APP_SECRET,
  kimiAuthUrl: parsed.data.KIMI_AUTH_URL,
  kimiOpenUrl: parsed.data.KIMI_OPEN_URL,
  ownerUnionId: parsed.data.OWNER_UNION_ID,
};
