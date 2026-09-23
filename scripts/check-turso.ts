// Script verifikasi koneksi Turso: cek daftar tabel dan jumlah baris per tabel.
// Jalankan: npx tsx scripts/check-turso.ts
import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL tidak ada di .env");
    process.exit(1);
  }
  console.log("URL:", url.split("?")[0]);

  const client = createClient({ url });

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_\\_%' ESCAPE '\\' ORDER BY name",
  );
  console.log("Tables:", tables.rows.map((r) => String(r.name)).join(", ") || "(kosong)");

  for (const t of ["buses", "routes", "employees", "schedules", "users"]) {
    try {
      const res = await client.execute(`SELECT COUNT(*) AS n FROM ${t}`);
      console.log(`  ${t}: ${res.rows[0].n} rows`);
    } catch (e) {
      console.log(`  ${t}: ERROR - ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

main();
