import { authRouter } from "./auth-router";
import { busRouter } from "./bus-router";
import { routeRouter } from "./route-router";
import { employeeRouter } from "./employee-router";
import { scheduleRouter } from "./schedule-router";
import { settingsRouter } from "./settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  bus: busRouter,
  route: routeRouter,
  employee: employeeRouter,
  schedule: scheduleRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
