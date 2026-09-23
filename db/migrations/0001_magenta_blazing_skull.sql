PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_buses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plat_nomor` text(50) NOT NULL,
	`merek` text(100) NOT NULL,
	`model` text(100),
	`kapasitas` integer NOT NULL,
	`fasilitas` text,
	`foto_url` text,
	`status` text DEFAULT 'aktif' NOT NULL,
	`tahun` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_buses`("id", "plat_nomor", "merek", "model", "kapasitas", "fasilitas", "foto_url", "status", "tahun", "created_at", "updated_at") SELECT "id", "plat_nomor", "merek", "model", "kapasitas", "fasilitas", "foto_url", "status", "tahun", "created_at", "updated_at" FROM `buses`;--> statement-breakpoint
DROP TABLE `buses`;--> statement-breakpoint
ALTER TABLE `__new_buses` RENAME TO `buses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `buses_plat_nomor_unique` ON `buses` (`plat_nomor`);--> statement-breakpoint
CREATE TABLE `__new_employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text(255) NOT NULL,
	`no_telp` text(20),
	`email` text(320),
	`alamat` text,
	`role` text NOT NULL,
	`no_sim` text(50),
	`jenis_sim` text(20),
	`foto_url` text,
	`status` text DEFAULT 'aktif' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_employees`("id", "nama", "no_telp", "email", "alamat", "role", "no_sim", "jenis_sim", "foto_url", "status", "created_at", "updated_at") SELECT "id", "nama", "no_telp", "email", "alamat", "role", "no_sim", "jenis_sim", "foto_url", "status", "created_at", "updated_at" FROM `employees`;--> statement-breakpoint
DROP TABLE `employees`;--> statement-breakpoint
ALTER TABLE `__new_employees` RENAME TO `employees`;--> statement-breakpoint
CREATE TABLE `__new_routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama_tujuan` text(150) NOT NULL,
	`kode_rute` text(50) NOT NULL,
	`harga_tiket` real NOT NULL,
	`estimasi_jam` integer NOT NULL,
	`estimasi_menit` integer DEFAULT 0 NOT NULL,
	`jarak_km` integer,
	`terminal_asal` text(200) NOT NULL,
	`terminal_tujuan` text(200) NOT NULL,
	`keterangan` text,
	`status` text DEFAULT 'aktif' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_routes`("id", "nama_tujuan", "kode_rute", "harga_tiket", "estimasi_jam", "estimasi_menit", "jarak_km", "terminal_asal", "terminal_tujuan", "keterangan", "status", "created_at", "updated_at") SELECT "id", "nama_tujuan", "kode_rute", "harga_tiket", "estimasi_jam", "estimasi_menit", "jarak_km", "terminal_asal", "terminal_tujuan", "keterangan", "status", "created_at", "updated_at" FROM `routes`;--> statement-breakpoint
DROP TABLE `routes`;--> statement-breakpoint
ALTER TABLE `__new_routes` RENAME TO `routes`;--> statement-breakpoint
CREATE UNIQUE INDEX `routes_nama_tujuan_unique` ON `routes` (`nama_tujuan`);--> statement-breakpoint
CREATE UNIQUE INDEX `routes_kode_rute_unique` ON `routes` (`kode_rute`);--> statement-breakpoint
CREATE TABLE `__new_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bus_id` integer NOT NULL,
	`rute_id` integer NOT NULL,
	`supir_id` integer NOT NULL,
	`kernet_id` integer,
	`tanggal` text NOT NULL,
	`waktu_berangkat` text NOT NULL,
	`waktu_sampai` text NOT NULL,
	`harga_tiket` real NOT NULL,
	`keterangan` text,
	`status` text DEFAULT 'tersedia' NOT NULL,
	`jumlah_penumpang` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_schedules`("id", "bus_id", "rute_id", "supir_id", "kernet_id", "tanggal", "waktu_berangkat", "waktu_sampai", "harga_tiket", "keterangan", "status", "jumlah_penumpang", "created_at", "updated_at") SELECT "id", "bus_id", "rute_id", "supir_id", "kernet_id", "tanggal", "waktu_berangkat", "waktu_sampai", "harga_tiket", "keterangan", "status", "jumlah_penumpang", "created_at", "updated_at" FROM `schedules`;--> statement-breakpoint
DROP TABLE `schedules`;--> statement-breakpoint
ALTER TABLE `__new_schedules` RENAME TO `schedules`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unionId` text NOT NULL,
	`name` text(255),
	`email` text(320),
	`avatar` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	`lastSignInAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "unionId", "name", "email", "avatar", "role", "createdAt", "updatedAt", "lastSignInAt") SELECT "id", "unionId", "name", "email", "avatar", "role", "createdAt", "updatedAt", "lastSignInAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_unionId_unique` ON `users` (`unionId`);