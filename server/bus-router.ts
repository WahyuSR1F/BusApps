import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { buses } from "../db/schema";
import { eq, like, desc, sql } from "drizzle-orm";

export const busRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, status, page = 1, limit = 10 } = input || {};
      
      const query = db.select().from(buses);
      
      const conditions = [];
      if (search) {
        conditions.push(like(buses.platNomor, `%${search}%`));
      }
      if (status) {
        conditions.push(eq(buses.status, status as "aktif" | "perbaikan" | "nonaktif"));
      }
      
      const allBuses = conditions.length > 0
        ? await query.where(sql`${conditions.reduce((acc, c, i) => i === 0 ? c : sql`${acc} AND ${c}`)}`).orderBy(desc(buses.createdAt))
        : await query.orderBy(desc(buses.createdAt));
      
      const total = allBuses.length;
      const start = (page - 1) * limit;
      const items = allBuses.slice(start, start + limit);
      
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(buses).where(eq(buses.id, input.id));
      return result[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        platNomor: z.string().min(1),
        merek: z.string().min(1),
        model: z.string().optional(),
        kapasitas: z.number().min(1),
        fasilitas: z.string().optional(),
        fotoUrl: z.string().optional(),
        status: z.enum(["aktif", "perbaikan", "nonaktif"]).default("aktif"),
        tahun: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(buses).values(input).returning({ id: buses.id });
      return { id: result[0].id, ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        platNomor: z.string().min(1).optional(),
        merek: z.string().min(1).optional(),
        model: z.string().optional(),
        kapasitas: z.number().min(1).optional(),
        fasilitas: z.string().optional(),
        fotoUrl: z.string().optional(),
        status: z.enum(["aktif", "perbaikan", "nonaktif"]).optional(),
        tahun: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(buses)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(buses.id, id));
      return { id, ...data };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(buses).where(eq(buses.id, input.id));
      return { success: true };
    }),
});
