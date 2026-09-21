import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";
import { env } from "../lib/env";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const client = createClient({ url: env.databaseUrl });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// Driver libsql mengembalikan lastInsertRowid (bigint) alih-alih insertId (MySQL).
export function getInsertId(result: { lastInsertRowid?: bigint | number | null }): number {
  return Number(result.lastInsertRowid ?? 0);
}
