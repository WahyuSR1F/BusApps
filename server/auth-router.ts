import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "../contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { hashPassword, verifyPassword } from "./lib/password";
import { signSessionToken } from "./kimi/session";
import {
  findUserByEmail,
  createUser,
  updateUser,
} from "./queries/users";
import { createRouter, publicQuery, authedQuery } from "./middleware";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  register: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(255),
        email: z.string().trim().toLowerCase().email().max(320),
        password: z.string().min(8).max(255),
        noTelp: z.string().trim().min(8).max(20).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email sudah terdaftar. Silakan login.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      // Register publik selalu menjadi pelanggan (role "user").
      // Akun admin dibuat terpisah via `npm run db:seed`.
      const user = await createUser({
        unionId: `email:${input.email}`,
        name: input.name,
        email: input.email,
        passwordHash,
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat akun. Coba lagi.",
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().trim().toLowerCase().email().max(320),
        password: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      // Pesan error disamakan agar tidak membocorkan keberadaan email.
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email atau password salah.",
        });
      }
      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email atau password salah.",
        });
      }

      await updateUser(user.id, {
        lastSignInAt: new Date().toISOString(),
      });

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "email-password",
      });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
