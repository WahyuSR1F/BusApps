import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { schedules, buses, routes, employees } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const scheduleRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        tanggal: z.string().optional(),
        busId: z.number().optional(),
        ruteId: z.number().optional(),
        status: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { tanggal, busId, ruteId, status, page = 1, limit = 10 } = input || {};
      
      const allSchedules = await db.select().from(schedules).orderBy(desc(schedules.createdAt));
      
      const allBuses = await db.select().from(buses);
      const allRoutes = await db.select().from(routes);
      const allEmployees = await db.select().from(employees);
      
      const busMap = new Map(allBuses.map(b => [b.id, b]));
      const routeMap = new Map(allRoutes.map(r => [r.id, r]));
      const employeeMap = new Map(allEmployees.map(e => [e.id, e]));
      
      let filtered = allSchedules.map(s => ({
        ...s,
        bus: busMap.get(s.busId) || null,
        route: routeMap.get(s.ruteId) || null,
        supir: employeeMap.get(s.supirId) || null,
        kernet: s.kernetId ? employeeMap.get(s.kernetId) || null : null,
      }));
      
      if (tanggal) {
        const dateStr = new Date(tanggal).toISOString().split('T')[0];
        filtered = filtered.filter(s => {
          const sDate = new Date(s.tanggal).toISOString().split('T')[0];
          return sDate === dateStr;
        });
      }
      if (busId) filtered = filtered.filter(s => s.busId === busId);
      if (ruteId) filtered = filtered.filter(s => s.ruteId === ruteId);
      if (status) filtered = filtered.filter(s => s.status === status);
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(schedules).where(eq(schedules.id, input.id));
      if (!result[0]) return null;
      
      const s = result[0];
      const busData = await db.select().from(buses).where(eq(buses.id, s.busId));
      const routeData = await db.select().from(routes).where(eq(routes.id, s.ruteId));
      const supirData = await db.select().from(employees).where(eq(employees.id, s.supirId));
      const kernetData = s.kernetId ? await db.select().from(employees).where(eq(employees.id, s.kernetId)) : [];
      
      return {
        ...s,
        bus: busData[0] || null,
        route: routeData[0] || null,
        supir: supirData[0] || null,
        kernet: kernetData[0] || null,
      };
    }),

  calendarEvents: publicQuery
    .query(async () => {
      const db = getDb();
      const allSchedules = await db.select().from(schedules).orderBy(desc(schedules.createdAt));
      
      const allBuses = await db.select().from(buses);
      const allRoutes = await db.select().from(routes);
      const allEmployees = await db.select().from(employees);
      
      const busMap = new Map(allBuses.map(b => [b.id, b]));
      const routeMap = new Map(allRoutes.map(r => [r.id, r]));
      const employeeMap = new Map(allEmployees.map(e => [e.id, e]));
      
      return allSchedules.map(s => {
        const route = routeMap.get(s.ruteId);
        const bus = busMap.get(s.busId);
        const supir = employeeMap.get(s.supirId);
        const kernet = s.kernetId ? employeeMap.get(s.kernetId) : null;
        
        return {
          id: String(s.id),
          title: `${route?.kodeRute || 'Unknown'} | ${bus?.platNomor || 'Unknown'}`,
          start: new Date(s.waktuBerangkat).toISOString(),
          end: new Date(s.waktuSampai).toISOString(),
          color: s.status === 'berangkat' ? '#f59e0b' : s.status === 'sampai' ? '#10b981' : s.status === 'batal' ? '#ef4444' : s.status === 'penuh' ? '#8b5cf6' : '#3b82f6',
          extendedProps: {
            busId: s.busId,
            ruteId: s.ruteId,
            supir: supir?.nama || 'Unknown',
            kernet: kernet?.nama || null,
            status: s.status,
            jumlahPenumpang: s.jumlahPenumpang,
            hargaTiket: s.hargaTiket,
          }
        };
      });
    }),

  create: publicQuery
    .input(
      z.object({
        busId: z.number(),
        ruteId: z.number(),
        supirId: z.number(),
        kernetId: z.number().optional(),
        tanggal: z.string(),
        waktuBerangkat: z.string(),
        waktuSampai: z.string(),
        hargaTiket: z.string(),
        keterangan: z.string().optional(),
        status: z.enum(["tersedia", "berangkat", "sampai", "batal", "penuh"]).default("tersedia"),
        jumlahPenumpang: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data = {
        ...input,
        tanggal: new Date(input.tanggal),
        waktuBerangkat: new Date(input.waktuBerangkat),
        waktuSampai: new Date(input.waktuSampai),
      };
      const result = await db.insert(schedules).values(data);
      return { id: Number(result[0].insertId), ...input };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        busId: z.number().optional(),
        ruteId: z.number().optional(),
        supirId: z.number().optional(),
        kernetId: z.number().optional().nullable(),
        tanggal: z.string().optional(),
        waktuBerangkat: z.string().optional(),
        waktuSampai: z.string().optional(),
        hargaTiket: z.string().optional(),
        keterangan: z.string().optional(),
        status: z.enum(["tersedia", "berangkat", "sampai", "batal", "penuh"]).optional(),
        jumlahPenumpang: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      
      const updateData: Record<string, unknown> = {};
      if (data.busId !== undefined) updateData.busId = data.busId;
      if (data.ruteId !== undefined) updateData.ruteId = data.ruteId;
      if (data.supirId !== undefined) updateData.supirId = data.supirId;
      if (data.kernetId !== undefined) updateData.kernetId = data.kernetId;
      if (data.tanggal !== undefined) updateData.tanggal = new Date(data.tanggal);
      if (data.waktuBerangkat !== undefined) updateData.waktuBerangkat = new Date(data.waktuBerangkat);
      if (data.waktuSampai !== undefined) updateData.waktuSampai = new Date(data.waktuSampai);
      if (data.hargaTiket !== undefined) updateData.hargaTiket = data.hargaTiket;
      if (data.keterangan !== undefined) updateData.keterangan = data.keterangan;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.jumlahPenumpang !== undefined) updateData.jumlahPenumpang = data.jumlahPenumpang;
      
      await db.update(schedules).set(updateData).where(eq(schedules.id, id));
      return { id, ...data };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schedules).where(eq(schedules.id, input.id));
      return { success: true };
    }),
});
