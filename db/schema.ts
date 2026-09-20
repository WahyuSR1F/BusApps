import {
  sqliteTable,
  integer,
  text,
  real,
  bigint,
} from "drizzle-orm/sqlite-core";

// ============================================================
// TABEL USER (ADMIN AUTH)
// ============================================================
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 320 }),
  avatar: text("avatar"),
  role: integer("role", { mode: "enum" }).default(0).notNull(),
  createdAt: text("createdAt").default((() => new Date().toISOString())()).notNull(),
  updatedAt: text("updatedAt").default((() => new Date().toISOString())()).notNull(),
  lastSignInAt: text("lastSignInAt").default((() => new Date().toISOString())()).notNull(),
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
  status: integer("status", { mode: "enum" }).default(0).notNull(),
  tahun: integer("tahun"),
  createdAt: text("created_at").default((() => new Date().toISOString())()).notNull(),
  updatedAt: text("updated_at").default((() => new Date().toISOString())()).notNull(),
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
  status: integer("status", { mode: "enum" }).default(0).notNull(),
  createdAt: text("created_at").default((() => new Date().toISOString())()).notNull(),
  updatedAt: text("updated_at").default((() => new Date().toISOString())()).notNull(),
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
  role: integer("role", { mode: "enum" }).notNull(),
  noSim: text("no_sim", { length: 50 }),
  jenisSim: text("jenis_sim", { length: 20 }),
  fotoUrl: text("foto_url"),
  status: integer("status", { mode: "enum" }).default(0).notNull(),
  createdAt: text("created_at").default((() => new Date().toISOString())()).notNull(),
  updatedAt: text("updated_at").default((() => new Date().toISOString())()).notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ============================================================
// TABEL JADWAL PERJALANAN
// ============================================================
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  busId: integer("bus_id", { unsigned: true }).notNull(),
  ruteId: integer("rute_id", { unsigned: true }).notNull(),
  supirId: integer("supir_id", { unsigned: true }).notNull(),
  kernetId: integer("kernet_id", { unsigned: true }),
  tanggal: text("tanggal").notNull(),
  waktuBerangkat: text("waktu_berangkat").notNull(),
  waktuSampai: text("waktu_sampai").notNull(),
  hargaTiket: real("harga_tiket").notNull(),
  keterangan: text("keterangan"),
  status: integer("status", { mode: "enum" }).default(0).notNull(),
  jumlahPenumpang: integer("jumlah_penumpang").default(0).notNull(),
  createdAt: text("created_at").default((() => new Date().toISOString())()).notNull(),
  updatedAt: text("updated_at").default((() => new Date().toISOString())()).notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
