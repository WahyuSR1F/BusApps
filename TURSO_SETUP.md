# Turso Setup Guide

## Current Status
✅ Configuration updated to support Turso (libSQL)
✅ Schema migrated from MySQL to SQLite
✅ Drizzle config updated to use SQLite dialect
✅ Single Serverless Function setup for Vercel Hobby plan

## Next Steps

### 1. Configure Database URL

Connection string comes from the `DATABASE_URL` environment variable — never hardcode it in scripts or commit it to Git.

```env
# .env (Turso remote)
DATABASE_URL=libsql://<your_database>.turso.io?authToken=<your_jwt_token>

# atau lokal untuk development
DATABASE_URL=file:./local.db
```

> ⚠️ **Security note**: skrip lama (`push-schema.mjs`, `setup-turso.sh`, `get-turso-url.mjs`)
> berisi token yang di-hardcode dan sudah dihapus. Jika token tersebut pernah ter-commit,
> **revoke token tersebut** di dashboard Turso (Database → Tokens → Revoke) dan buat yang baru.

### 2. Generate and Apply Migrations

```bash
# Generate migration files dari db/schema.ts
npm run db:generate

# Terapkan ke database (Turso / lokal)
npm run db:migrate

# atau drift-based sync (development)
npm run db:push
```

### 3. Seed (Opsional)

```bash
npm run db:seed
```

### 4. Verify Connection

```bash
npm run dev
```

## Deploy ke Vercel (Hobby Plan)

Hobby plan membatasi maksimal **12 Serverless Functions per deployment**. Struktur
backend sudah direstrukturisasi agar hanya ada **1 function**:

- `server/` — semua kode backend (Hono + tRPC). Folder ini **tidak** di-scan Vercel
  sebagai functions karena namanya bukan `api/`.
- `api/index.ts` — **satu-satunya** file di folder `api/` → 1 Serverless Function yang
  menangani semua request `/api/*` via `hono/vercel` adapter.
- `vercel.json` — rewrite `/api/(.*)` → `/api/index`, output static `dist/public`.

Env vars yang harus di-set di Vercel Project Settings → Environment Variables:

| Variable | Keterangan |
| --- | --- |
| `DATABASE_URL` | Connection string Turso (`libsql://...`) |
| `APP_ID` / `APP_SECRET` | Kimi OAuth credentials |
| `KIMI_AUTH_URL` / `KIMI_OPEN_URL` | Kimi OAuth/open server URL |
| `OWNER_UNION_ID` | Union ID yang otomatis mendapat role `admin` |
| `NODE_ENV` | `production` (biasanya otomatis) |

## Migration Notes (MySQL → SQLite)

- `mysqlTable` → `sqliteTable`
- `mysqlEnum` / `integer({ mode: "enum" })` → `text({ enum: [...] })` — mode valid untuk
  `integer()` di SQLite hanya `"number" | "boolean" | "timestamp" | "timestamp_ms"`
- `serial` → `integer(...).primaryKey({ autoIncrement: true })`
- `varchar` → `text`
- `timestamp` → `text` (ISO string), default `sql\`(datetime('now'))\``
- `int` → `integer`, `decimal` → `real`
- Opsi `{ unsigned: true }` **tidak ada** di SQLite — dihapus
- `result.insertId` (MySQL) → `.returning({ id })` atau `result.lastInsertRowid` (libSQL)
- `onDuplicateKeyUpdate` (MySQL) → `onConflictDoUpdate({ target, set })` (SQLite)

## Common Issues

1. **"Database URL is required"**: pastikan `DATABASE_URL` ada di `.env` / Vercel env vars
2. **Migration conflicts**: bersihkan folder `db/migrations` dan regenerate jika perlu
3. **Auth errors**: verifikasi token Turso masih valid
4. **Limit exceeded di Vercel**: pastikan tidak ada file lain di folder `api/`

## Support

- Turso Documentation: https://turso.tech/docs
- Drizzle ORM SQLite: https://orm.drizzle.team/docs/get-started-sqlite
