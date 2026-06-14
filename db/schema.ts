import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

// ============================================================
// TABEL USER (ADMIN AUTH)
// ============================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// TABEL BUS
// ============================================================
export const buses = mysqlTable("buses", {
  id: serial("id").primaryKey(),
  platNomor: varchar("plat_nomor", { length: 50 }).notNull().unique(),
  merek: varchar("merek", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }),
  kapasitas: int("kapasitas").notNull(),
  fasilitas: text("fasilitas"),
  fotoUrl: text("foto_url"),
  status: mysqlEnum("status", ["aktif", "perbaikan", "nonaktif"]).default("aktif").notNull(),
  tahun: int("tahun"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Bus = typeof buses.$inferSelect;
export type InsertBus = typeof buses.$inferInsert;

// ============================================================
// TABEL RUTE / TUJUAN
// ============================================================
export const routes = mysqlTable("routes", {
  id: serial("id").primaryKey(),
  namaTujuan: varchar("nama_tujuan", { length: 150 }).notNull().unique(),
  kodeRute: varchar("kode_rute", { length: 50 }).notNull().unique(),
  hargaTiket: decimal("harga_tiket", { precision: 12, scale: 2 }).notNull(),
  estimasiJam: int("estimasi_jam").notNull(),
  estimasiMenit: int("estimasi_menit").default(0).notNull(),
  jarakKm: int("jarak_km"),
  terminalAsal: varchar("terminal_asal", { length: 200 }).notNull(),
  terminalTujuan: varchar("terminal_tujuan", { length: 200 }).notNull(),
  keterangan: text("keterangan"),
  status: mysqlEnum("status", ["aktif", "nonaktif"]).default("aktif").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

// ============================================================
// TABEL KARYAWAN (SUPIR & KERNET)
// ============================================================
export const employees = mysqlTable("employees", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  noTelp: varchar("no_telp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  alamat: text("alamat"),
  role: mysqlEnum("role", ["supir", "kernet"]).notNull(),
  noSim: varchar("no_sim", { length: 50 }),
  jenisSim: varchar("jenis_sim", { length: 20 }),
  fotoUrl: text("foto_url"),
  status: mysqlEnum("status", ["aktif", "cuti", "nonaktif"]).default("aktif").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// ============================================================
// TABEL JADWAL PERJALANAN
// ============================================================
export const schedules = mysqlTable("schedules", {
  id: serial("id").primaryKey(),
  busId: bigint("bus_id", { mode: "number", unsigned: true }).notNull(),
  ruteId: bigint("rute_id", { mode: "number", unsigned: true }).notNull(),
  supirId: bigint("supir_id", { mode: "number", unsigned: true }).notNull(),
  kernetId: bigint("kernet_id", { mode: "number", unsigned: true }),
  tanggal: timestamp("tanggal").notNull(),
  waktuBerangkat: timestamp("waktu_berangkat").notNull(),
  waktuSampai: timestamp("waktu_sampai").notNull(),
  hargaTiket: decimal("harga_tiket", { precision: 12, scale: 2 }).notNull(),
  keterangan: text("keterangan"),
  status: mysqlEnum("status", ["tersedia", "berangkat", "sampai", "batal", "penuh"]).default("tersedia").notNull(),
  jumlahPenumpang: int("jumlah_penumpang").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
