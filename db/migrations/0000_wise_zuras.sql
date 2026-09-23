CREATE TABLE `buses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plat_nomor` text(50) NOT NULL,
	`merek` text(100) NOT NULL,
	`model` text(100),
	`kapasitas` integer NOT NULL,
	`fasilitas` text,
	`foto_url` text,
	`status` integer DEFAULT 0 NOT NULL,
	`tahun` integer,
	`created_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `buses_plat_nomor_unique` ON `buses` (`plat_nomor`);--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text(255) NOT NULL,
	`no_telp` text(20),
	`email` text(320),
	`alamat` text,
	`role` integer NOT NULL,
	`no_sim` text(50),
	`jenis_sim` text(20),
	`foto_url` text,
	`status` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routes` (
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
	`status` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routes_nama_tujuan_unique` ON `routes` (`nama_tujuan`);--> statement-breakpoint
CREATE UNIQUE INDEX `routes_kode_rute_unique` ON `routes` (`kode_rute`);--> statement-breakpoint
CREATE TABLE `schedules` (
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
	`status` integer DEFAULT 0 NOT NULL,
	`jumlah_penumpang` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL,
	`updated_at` text DEFAULT '2026-09-20T17:57:02.276Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unionId` text NOT NULL,
	`name` text(255),
	`email` text(320),
	`avatar` text,
	`role` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT '2026-09-20T17:57:02.274Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-09-20T17:57:02.275Z' NOT NULL,
	`lastSignInAt` text DEFAULT '2026-09-20T17:57:02.275Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_unionId_unique` ON `users` (`unionId`);