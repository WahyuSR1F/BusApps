import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { employees } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const employeeRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["supir", "kernet"]).optional(),
        status: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, role, status, page = 1, limit = 10 } = input || {};
      
      let query = db.select().from(employees);
      
      const allEmployees = await query.orderBy(desc(employees.createdAt));
      
      let filtered = allEmployees;
      if (search) {
        filtered = filtered.filter(e => e.nama.toLowerCase().includes(search.toLowerCase()));
      }
      if (role) {
        filtered = filtered.filter(e => e.role === role);
      }
      if (status) {
        filtered = filtered.filter(e => e.status === status);
      }
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(employees).where(eq(employees.id, input.id));
      return result[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        noTelp: z.string().optional(),
        email: z.string().optional(),
        alamat: z.string().optional(),
        role: z.enum(["supir", "kernet"]),
        noSim: z.string().optional(),
        jenisSim: z.string().optional(),
        fotoUrl: z.string().optional(),
        status: z.enum(["aktif", "cuti", "nonaktif"]).default("aktif"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .insert(employees)
        .values(input)
        .returning({ id: employees.id });
      return { id: result[0].id, ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        noTelp: z.string().optional(),
        email: z.string().optional(),
        alamat: z.string().optional(),
        role: z.enum(["supir", "kernet"]).optional(),
        noSim: z.string().optional(),
        jenisSim: z.string().optional(),
        fotoUrl: z.string().optional(),
        status: z.enum(["aktif", "cuti", "nonaktif"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(employees)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(employees.id, id));
      return { id, ...data };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(employees).where(eq(employees.id, input.id));
      return { success: true };
    }),
});
