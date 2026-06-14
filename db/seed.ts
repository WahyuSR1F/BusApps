import { getDb } from "../api/queries/connection";
import { buses, routes, employees, schedules } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed Buses
  const busData = [
    { platNomor: "B 1234 ABC", merek: "Mercedes-Benz", model: "OH 1626", kapasitas: 45, fasilitas: 'AC, TV, Toilet, WiFi', status: "aktif" as const, tahun: 2022 },
    { platNomor: "B 5678 DEF", merek: "Hino", model: "RN 285", kapasitas: 50, fasilitas: 'AC, TV, Toilet', status: "aktif" as const, tahun: 2023 },
    { platNomor: "B 9012 GHI", merek: "Scania", model: "K410", kapasitas: 40, fasilitas: 'AC, TV, Toilet, WiFi, USB Charger', status: "aktif" as const, tahun: 2023 },
    { platNomor: "B 3456 JKL", merek: "Volvo", model: "B11R", kapasitas: 45, fasilitas: 'AC, TV, Toilet, WiFi', status: "perbaikan" as const, tahun: 2021 },
    { platNomor: "B 7890 MNO", merek: "Isuzu", model: "LT 134", kapasitas: 35, fasilitas: 'AC, TV', status: "aktif" as const, tahun: 2022 },
    { platNomor: "B 1111 PQR", merek: "Mercedes-Benz", model: "OH 1526", kapasitas: 42, fasilitas: 'AC, TV, Toilet, WiFi, USB Charger', status: "aktif" as const, tahun: 2024 },
  ];

  for (const bus of busData) {
    await db.insert(buses).values(bus);
  }
  console.log("Buses seeded.");

  // Seed Routes
  const routeData = [
    { namaTujuan: "Surabaya", kodeRute: "JKT-SBY", hargaTiket: "350000", estimasiJam: 12, estimasiMenit: 30, jarakKm: 780, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Bungurasih", keterangan: "Via tol Trans-Java" },
    { namaTujuan: "Yogyakarta", kodeRute: "JKT-YOG", hargaTiket: "280000", estimasiJam: 10, estimasiMenit: 0, jarakKm: 520, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Giwangan", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Semarang", kodeRute: "JKT-SMG", hargaTiket: "220000", estimasiJam: 8, estimasiMenit: 30, jarakKm: 450, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Terboyo", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Malang", kodeRute: "JKT-MLG", hargaTiket: "380000", estimasiJam: 14, estimasiMenit: 0, jarakKm: 850, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Arjosari", keterangan: "Via tol Trans-Java" },
    { namaTujuan: "Bandung", kodeRute: "JKT-BDG", hargaTiket: "120000", estimasiJam: 3, estimasiMenit: 30, jarakKm: 150, terminalAsal: "Terminal Lebak Bulus", terminalTujuan: "Terminal Leuwi Panjang", keterangan: "Via tol Cipularang" },
    { namaTujuan: "Solo", kodeRute: "JKT-SLO", hargaTiket: "300000", estimasiJam: 10, estimasiMenit: 30, jarakKm: 560, terminalAsal: "Terminal Pulo Gebang", terminalTujuan: "Terminal Tirtonadi", keterangan: "Via tol Trans-Java" },
  ];

  for (const route of routeData) {
    await db.insert(routes).values(route);
  }
  console.log("Routes seeded.");

  // Seed Employees (Supir)
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

  // Seed Employees (Kernet)
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

  // Seed Schedules
  const now = new Date();
  const scheduleData = [
    {
      busId: 1, ruteId: 1, supirId: 1, kernetId: 1,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 30),
      hargaTiket: "350000", status: "tersedia" as const, jumlahPenumpang: 12,
    },
    {
      busId: 2, ruteId: 2, supirId: 2, kernetId: 2,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0),
      hargaTiket: "280000", status: "tersedia" as const, jumlahPenumpang: 28,
    },
    {
      busId: 3, ruteId: 3, supirId: 3, kernetId: 3,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30),
      hargaTiket: "220000", status: "berangkat" as const, jumlahPenumpang: 40,
    },
    {
      busId: 5, ruteId: 5, supirId: 5, kernetId: 4,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30),
      hargaTiket: "120000", status: "sampai" as const, jumlahPenumpang: 32,
    },
    {
      busId: 6, ruteId: 4, supirId: 1, kernetId: 1,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 6, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 6, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 20, 0),
      hargaTiket: "380000", status: "tersedia" as const, jumlahPenumpang: 5,
    },
    {
      busId: 1, ruteId: 2, supirId: 3, kernetId: 2,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 8, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 8, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 0),
      hargaTiket: "280000", status: "tersedia" as const, jumlahPenumpang: 0,
    },
    {
      busId: 2, ruteId: 6, supirId: 2, kernetId: 3,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 7, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 7, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 17, 30),
      hargaTiket: "300000", status: "penuh" as const, jumlahPenumpang: 50,
    },
    {
      busId: 3, ruteId: 1, supirId: 5, kernetId: 4,
      tanggal: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0),
      waktuBerangkat: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0),
      waktuSampai: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 30),
      hargaTiket: "350000", status: "berangkat" as const, jumlahPenumpang: 38,
    },
  ];

  for (const schedule of scheduleData) {
    await db.insert(schedules).values(schedule);
  }
  console.log("Schedules seeded.");

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
