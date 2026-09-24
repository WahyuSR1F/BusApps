import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteSettings } from "../db/schema";
import { normalizeWhatsapp } from "./auth-router";

// Pengaturan situs tersimpan sebagai satu baris (id = 1). Query publik boleh
// membaca (untuk halaman kontak/footer), hanya admin boleh mengubah.
const SETTINGS_ID = 1;

const terminalsSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(200),
    city: z.string().trim().max(100).default(""),
  }),
);

const settingsInputSchema = z.object({
  appName: z.string().trim().min(1).max(100).optional().or(z.literal("")),
  phonePrimary: z.string().trim().max(50).optional().or(z.literal("")),
  phoneSecondary: z.string().trim().max(50).optional().or(z.literal("")),
  emailPrimary: z.string().trim().max(320).optional().or(z.literal("")),
  emailSecondary: z.string().trim().max(320).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  addressDetail: z.string().trim().max(300).optional().or(z.literal("")),
  operationalHours: z.string().trim().max(200).optional().or(z.literal("")),
  operationalDetail: z.string().trim().max(200).optional().or(z.literal("")),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]*$/, "Nomor hanya boleh berisi angka dan karakter + - ( )")
    .optional()
    .or(z.literal("")),
  terminals: terminalsSchema.max(10).optional(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

async function getSettingsRow() {
  const db = getDb();
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SETTINGS_ID))
    .limit(1);
  // Self-healing: jika baris belum ada (DB baru), buat otomatis.
  if (!rows[0]) {
    await db.insert(siteSettings).values({ id: SETTINGS_ID });
    const created = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, SETTINGS_ID))
      .limit(1);
    return created[0] ?? null;
  }
  return rows[0] ?? null;
}

export const settingsRouter = createRouter({
  // Publik: dipakai KontakPage & Footer.
  get: publicQuery.query(async () => {
    const row = await getSettingsRow();
    if (!row) return null;
    let terminals: { name: string; city: string }[] = [];
    try {
      const parsed = JSON.parse(row.terminals || "[]");
      if (Array.isArray(parsed)) terminals = parsed;
    } catch {
      terminals = [];
    }
    return { ...row, terminals };
  }),

  // Admin: simpan pengaturan (partial update, kolom kosong = hapus nilai).
  update: adminQuery
    .input(settingsInputSchema)
    .mutation(async ({ input }) => {
      await getSettingsRow(); // pastikan baris ada
      const db = getDb();

      const data: Partial<typeof siteSettings.$inferInsert> = {
        updatedAt: new Date().toISOString(),
      };
      if (input.appName !== undefined) {
        // String kosong disimpan NULL agar fallback ke default.
        data.appName = input.appName === "" ? null : input.appName;
      }
      const stringFields = [
        "phonePrimary",
        "phoneSecondary",
        "emailPrimary",
        "emailSecondary",
        "address",
        "addressDetail",
        "operationalHours",
        "operationalDetail",
      ] as const;
      for (const key of stringFields) {
        if (input[key] !== undefined) {
          // String kosong disimpan NULL agar "terhapus".
          data[key] = input[key] === "" ? null : input[key];
        }
      }
      if (input.whatsapp !== undefined) {
        data.whatsapp = input.whatsapp === "" ? null : normalizeWhatsapp(input.whatsapp);
      }
      if (input.terminals !== undefined) {
        data.terminals = JSON.stringify(input.terminals);
      }

      await db
        .update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, SETTINGS_ID));

      return { success: true };
    }),
});
