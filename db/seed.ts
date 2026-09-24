import "dotenv/config";
import { getDb } from "../server/queries/connection";
import { buses, routes, employees, schedules, users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/lib/password";

// Kolom tanggal/waktu di SQLite disimpan sebagai text (ISO string),
// hargaTiket sebagai real (number).
const at = (dayOffset: number, hour: number, minute = 0) => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hour,
    minute,
  ).toISOString();
};

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // ==========================================================
  // Akun admin dari env var (wajib):
  //   ADMIN_EMAIL    — email login admin
  //   ADMIN_PASSWORD — password admin (min. 8 karakter)
  // Idempotent: kalau email sudah ada, password di-update.
  // Jalankan: npm run db:seed
  // ==========================================================
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL dan ADMIN_PASSWORD wajib di-set di .env sebelum seeding",
    );
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD minimal 8 karakter");
  }

  const adminPasswordHash = await hashPassword(adminPassword);
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length > 0) {
    await db
      .update(users)
      .set({ passwordHash: adminPasswordHash, role: "admin" })
      .where(eq(users.id, existingAdmin[0].id));
    console.log(`Admin diperbarui: ${adminEmail}`);
  } else {
    await db.insert(users).values({
      unionId: `email:${adminEmail}`,
      name: "Admin SafaTrans",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
    });
    console.log(`Admin dibuat: ${adminEmail}`);
  }

  // ==========================================================
  // Guard idempoten: seed data demo hanya kalau tabel masih kosong,
  // agar `db:seed` aman dijalankan berulang.
  // ==========================================================
  const existingBuses = await db.select({ id: buses.id }).from(buses).limit(1);
  if (existingBuses.length === 0) {
    await seedBuses(db);
  } else {
    console.log("Buses sudah ada, skip seed data demo.");
  }

  const existingRoutes = await db.select({ id: routes.id }).from(routes).limit(1);
  if (existingRoutes.length === 0) {
    await seedRoutes(db);
  } else {
    console.log("Routes sudah ada, skip seed data demo.");
  }

  const existingEmployees = await db
    .select({ id: employees.id })
    .from(employees)
    .limit(1);
  if (existingEmployees.length === 0) {
    await seedEmployees(db);
  } else {
    console.log("Employees sudah ada, skip seed data demo.");
  }

  const existingSchedules = await db
    .select({ id: schedules.id })
    .from(schedules)
    .limit(1);
  if (existingSchedules.length === 0) {
    await seedSchedules(db);
  } else {
    console.log("Schedules sudah ada, skip seed data demo.");
  }

  console.log("Database seeded successfully!");
}

async function seedBuses(db: ReturnType<typeof getDb>) {
  const busData = [
    { platNomor: "B 1234 ABC", merek: "Mercedes-Benz", model: "OH 1626", kapasitas: 45, fasilitas: "AC, TV, Toilet, WiFi", status: "aktif" as const, tahun: 2022 },
    { platNomor: "B 5678 DEF", merek: "Hino", model: "RN 285", kapasitas: 50, fasilitas: "AC, TV, Toilet", status: "aktif" as const, tahun: 2023 },
    { platNomor: "B 9012 GHI", merek: "Scania", model: "K410", kapasitas: 40, fasilitas: "AC, TV, Toilet, WiFi, USB Charger", status: "aktif" as const, tahun: 2023 },
    { platNomor: "B 3456 JKL", merek: "Volvo", model: "B11R", kapasitas: 45, fasilitas: "AC, TV, Toilet, WiFi", status: "perbaikan" as const, tahun: 2021 },
    { platNomor: "B 7890 MNO", merek: "Isuzu", model: "LT 134", kapasitas: 35, fasilitas: "AC, TV", status: "aktif" as const, tahun: 2022 },
    { platNomor: "B 1111 PQR", merek: "Mercedes-Benz", model: "OH 1526", kapasitas: 42, fasilitas: "AC, TV, Toilet, WiFi, USB Charger", status: "aktif" as const, tahun: 2024 },
  ];

  for (const bus of busData) {
    await db.insert(buses).values(bus);
  }
  console.log("Buses seeded.");
}

async function seedRoutes(db: ReturnType<typeof getDb>) {
  const routeData = [
    { namaTujuan: "Surabaya", kodeRute: "JKT-SBY", hargaTiket: 350000, estimasiJam: 12, estimasiMenit: 30, jarakKm: 780, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Bungurasih", keterangan: "Via tol Trans-Java" },
    { namaTujuan: "Yogyakarta", kodeRute: "JKT-YOG", hargaTiket: 280000, estimasiJam: 10, estimasiMenit: 0, jarakKm: 520, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Giwangan", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Semarang", kodeRute: "JKT-SMG", hargaTiket: 220000, estimasiJam: 8, estimasiMenit: 30, jarakKm: 450, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Terboyo", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Malang", kodeRute: "JKT-MLG", hargaTiket: 380000, estimasiJam: 14, estimasiMenit: 0, jarakKm: 850, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Arjosari", keterangan: "Via tol Trans-Java" },
    { namaTujuan: "Bandung", kodeRute: "JKT-BDG", hargaTiket: 120000, estimasiJam: 3, estimasiMenit: 30, jarakKm: 150, terminalAsal: "Terminal Lebak Bulus", terminalTujuan: "Terminal Leuwi Panjang", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Solo", kodeRute: "JKT-SLO", hargaTiket: 300000, estimasiJam: 10, estimasiMenit: 30, jarakKm: 560, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Tirtonadi", keterangan: "Via tol Cipularang" },
  ];

  for (const route of routeData) {
    await db.insert(routes).values(route);
  }
  console.log("Routes seeded.");
}

async function seedEmployees(db: ReturnType<typeof getDb>) {
  const supirData = [
    { nama: "Budi Santoso", noTelp: "081234567890", email: "budi@email.com", alamat: "Jl. Mawar No. 1, Jakarta", role: "supir" as const, noSim: "SIM123456", jenisSim: "B2", status: "aktif" as const },
    { nama: "Ahmad Wijaya", noTelp: "081234567891", email: "ahmad@email.com", alamat: "Jl. Melati No. 2, Jakarta", role: "supir" as const, noSim: "SIM123457", jenisSim: "B2", status: "aktif" as const },
    { nama: "Candra Dimas", noTelp: "081234567892", email: "candra@email.com", alamat: "Jl. Anggrek No. 3, Jakarta", role: "supir" as const, noSim: "SIM123458", jenisSim: "B2", status: "aktif" as const },
    { nama: "Dedi Kurniawan", noTelp: "081234567893", email: "dedi@email.com", alamat: "Jl. Kenanga No. 4, Jakarta", role: "supir" as const, noSim: "SIM123459", jenisSim: "B2", status: "cuti" as const },
    { nama: "Eko Prasetyo", noTelp: "081234567894", email: "eko@email.com", alamat: "Jl. Cempaka No. 5, Jakarta", role: "supir" as const, noSim: "SIM123460", jenisSim: "B1", status: "aktif" as const },
  ];

  for (const supir of supirData) {
    await db.insert(employees).values(supir);
  }

  const kernetData = [
    { nama: "Rudi Hartono", noTelp: "081345678901", email: "rudi@email.com", alamat: "Jl. Dahlia No. 10, Jakarta", role: "kernet" as const, status: "aktif" as const },
    { nama: "Sigit Prabowo", noTelp: "081345678902", email: "sigit@email.com", alamat: "Jl. Tulip No. 11, Jakarta", role: "kernet" as const, status: "aktif" as const },
    { nama: "Teguh Sulistio", noTelp: "081345678903", email: "teguh@email.com", alamat: "Jl. Mawar No. 12, Jakarta", role: "kernet" as const, status: "aktif" as const },
    { nama: "Ujang Suryana", noTelp: "081345678904", email: "ujang@email.com", alamat: "Jl. Melati No. 13, Jakarta", role: "kernet" as const, status: "aktif" as const },
    { nama: "Vidi Alfiansyah", noTelp: "081345678905", email: "vidi@email.com", alamat: "Jl. Anggrek No. 14, Jakarta", role: "kernet" as const, status: "cuti" as const },
  ];

  for (const kernet of kernetData) {
    await db.insert(employees).values(kernet);
  }
  console.log("Employees seeded.");
}

async function seedSchedules(db: ReturnType<typeof getDb>) {
  const scheduleData = [
    {
      busId: 1, ruteId: 1, supirId: 1, kernetId: 1,
      tanggal: at(1, 8),
      waktuBerangkat: at(1, 8),
      waktuSampai: at(1, 20, 30),
      hargaTiket: 350000, status: "tersedia" as const, jumlahPenumpang: 12,
    },
    {
      busId: 2, ruteId: 2, supirId: 2, kernetId: 2,
      tanggal: at(1, 9),
      waktuBerangkat: at(1, 9),
      waktuSampai: at(1, 19),
      hargaTiket: 280000, status: "tersedia" as const, jumlahPenumpang: 28,
    },
    {
      busId: 3, ruteId: 3, supirId: 3, kernetId: 3,
      tanggal: at(0, 7),
      waktuBerangkat: at(0, 7),
      waktuSampai: at(0, 15, 30),
      hargaTiket: 220000, status: "berangkat" as const, jumlahPenumpang: 40,
    },
    {
      busId: 5, ruteId: 5, supirId: 5, kernetId: 4,
      tanggal: at(0, 10),
      waktuBerangkat: at(0, 10),
      waktuSampai: at(0, 13, 30),
      hargaTiket: 120000, status: "sampai" as const, jumlahPenumpang: 32,
    },
    {
      busId: 6, ruteId: 4, supirId: 1, kernetId: 1,
      tanggal: at(2, 6),
      waktuBerangkat: at(2, 6),
      waktuSampai: at(2, 20),
      hargaTiket: 380000, status: "tersedia" as const, jumlahPenumpang: 5,
    },
    {
      busId: 1, ruteId: 2, supirId: 3, kernetId: 2,
      tanggal: at(2, 8),
      waktuBerangkat: at(2, 8),
      waktuSampai: at(2, 18),
      hargaTiket: 280000, status: "tersedia" as const, jumlahPenumpang: 0,
    },
    {
      busId: 2, ruteId: 6, supirId: 2, kernetId: 3,
      tanggal: at(3, 7),
      waktuBerangkat: at(3, 7),
      waktuSampai: at(3, 17, 30),
      hargaTiket: 300000, status: "penuh" as const, jumlahPenumpang: 50,
    },
    {
      busId: 3, ruteId: 1, supirId: 5, kernetId: 4,
      tanggal: at(0, 20),
      waktuBerangkat: at(0, 20),
      waktuSampai: at(1, 8, 30),
      hargaTiket: 350000, status: "berangkat" as const, jumlahPenumpang: 38,
    },
  ];

  for (const schedule of scheduleData) {
    await db.insert(schedules).values(schedule);
  }
  console.log("Schedules seeded.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
