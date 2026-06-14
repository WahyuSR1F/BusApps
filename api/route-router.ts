import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { routes } from "../db/schema";
import { eq, like, desc, sql } from "drizzle-orm";

export const routeRouter = createRouter({
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
      
      let query = db.select().from(routes);
      
      const conditions = [];
      if (search) {
        conditions.push(like(routes.namaTujuan, `%${search}%`));
      }
      if (status) {
        conditions.push(eq(routes.status, status as "aktif" | "nonaktif"));
      }
      
      const allRoutes = conditions.length > 0
        ? await query.where(sql`${conditions.reduce((acc, c, i) => i === 0 ? c : sql`${acc} AND ${c}`)}`).orderBy(desc(routes.createdAt))
        : await query.orderBy(desc(routes.createdAt));
      
      const total = allRoutes.length;
      const start = (page - 1) * limit;
      const items = allRoutes.slice(start, start + limit);
      
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(routes).where(eq(routes.id, input.id));
      return result[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        namaTujuan: z.string().min(1),
        kodeRute: z.string().min(1),
        hargaTiket: z.string().min(1),
        estimasiJam: z.number().min(0),
        estimasiMenit: z.number().min(0).default(0),
        jarakKm: z.number().optional(),
        terminalAsal: z.string().min(1),
        terminalTujuan: z.string().min(1),
        keterangan: z.string().optional(),
        status: z.enum(["aktif", "nonaktif"]).default("aktif"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(routes).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        namaTujuan: z.string().min(1).optional(),
        kodeRute: z.string().min(1).optional(),
        hargaTiket: z.string().optional(),
        estimasiJam: z.number().min(0).optional(),
        estimasiMenit: z.number().min(0).optional(),
        jarakKm: z.number().optional(),
        terminalAsal: z.string().optional(),
        terminalTujuan: z.string().optional(),
        keterangan: z.string().optional(),
        status: z.enum(["aktif", "nonaktif"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(routes).set(data).where(eq(routes.id, id));
      return { id, ...data };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(routes).where(eq(routes.id, input.id));
      return { success: true };
    }),
});
