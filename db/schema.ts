import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// Catatan migrasi MySQL -> SQLite (Turso):
// - `mysqlEnum` / `integer({ mode: "enum" })` -> `text({ enum: [...] })`
//   (SQLite tidak punya mode "enum" untuk integer; opsi valid hanya
//   "number" | "boolean" | "timestamp" | "timestamp_ms")
// - `{ unsigned: true }` tidak ada di SQLite -> dihapus
// - `serial` -> `integer(...).primaryKey({ autoIncrement: true })`
// - `timestamp` -> `text` berisi ISO string, default DB `datetime('now')`

// ============================================================
// TABEL USER (ADMIN AUTH)
// ============================================================
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 320 }),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updatedAt").default(sql`(datetime('now'))`).notNull(),
  lastSignInAt: text("lastSignInAt").default(sql`(datetime('now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// TABEL BUS
// ============================================================
export const buses = sqliteTable("buses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platNomor: text("plat_nomor", { length: 50 }).notNull().unique(),
  merek: text("merek", { length: 100 }).notNull(),
  model: text("model", { length: 100 }),
  kapasitas: integer("kapasitas").notNull(),
  fasilitas: text("fasilitas"),
  fotoUrl: text("foto_url"),
  status: text("status", { enum: ["aktif", "perbaikan", "nonaktif"] })
    .default("aktif")
    .notNull(),
  tahun: integer("tahun"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

export type Bus = typeof buses.$inferSelect;
export type InsertBus = typeof buses.$inferInsert;

// ============================================================
// TABEL RUTE / TUJUAN
// ============================================================
export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaTujuan: text("nama_tujuan", { length: 150 }).notNull().unique(),
  kodeRute: text("kode_rute", { length: 50 }).notNull().unique(),
  hargaTiket: real("harga_tiket").notNull(),
  estimasiJam: integer("estimasi_jam").notNull(),
  estimasiMenit: integer("estimasi_menit").default(0).notNull(),
  jarakKm: integer("jarak_km"),
  terminalAsal: text("terminal_asal", { length: 200 }).notNull(),
  terminalTujuan: text("terminal_tujuan", { length: 200 }).notNull(),
  keterangan: text("keterangan"),
  status: text("status", { enum: ["aktif", "nonaktif"] })
    .default("aktif")
    .notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

// ============================================================
// TABEL KARYAWAN (SUPIR & KERNET)
// ============================================================
export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama", { length: 255 }).notNull(),
  noTelp: text("no_telp", { length: 20 }),
  email: text("email", { length: 320 }),
  alamat: text("alamat"),
  role: text("role", { enum: ["supir", "kernet"] }).notNull(),
  noSim: text("no_sim", { length: 50 }),
  jenisSim: text("jenis_sim", { length: 20 }),
  fotoUrl: text("foto_url"),
  status: text("status", { enum: ["aktif", "cuti", "nonaktif"] })
    .default("aktif")
    .notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ============================================================
// TABEL JADWAL PERJALANAN
// ============================================================
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  busId: integer("bus_id").notNull(),
  ruteId: integer("rute_id").notNull(),
  supirId: integer("supir_id").notNull(),
  kernetId: integer("kernet_id"),
  tanggal: text("tanggal").notNull(),
  waktuBerangkat: text("waktu_berangkat").notNull(),
  waktuSampai: text("waktu_sampai").notNull(),
  hargaTiket: real("harga_tiket").notNull(),
  keterangan: text("keterangan"),
  status: text("status", {
    enum: ["tersedia", "berangkat", "sampai", "batal", "penuh"],
  })
    .default("tersedia")
    .notNull(),
  jumlahPenumpang: integer("jumlah_penumpang").default(0).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
