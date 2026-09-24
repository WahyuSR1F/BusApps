import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "../contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { hashPassword, verifyPassword } from "./lib/password";
import { signSessionToken } from "./kimi/session";
import {
  findUserByEmail,
  findUserByUnionId,
  createUser,
  updateUser,
} from "./queries/users";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { verifyTurnstileToken } from "./lib/turnstile";

// Normalisasi nomor WhatsApp ke format internasional tanpa "+" (untuk link wa.me).
// 0812-3456-7890 -> 628123456789, +62 812... -> 62812...
export function normalizeWhatsapp(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return digits;
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  // Perbarui profil user yang sedang login (dipakai halaman Profil admin).
  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(255).optional(),
        // Nomor WhatsApp bebas format di input; dinormalisasi sebelum disimpan.
        whatsapp: z
          .string()
          .trim()
          .regex(/^[0-9+\-\s()]{8,20}$/, "Nomor WhatsApp tidak valid")
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data: { name?: string; whatsapp?: string | null } = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.whatsapp !== undefined) {
        // String kosong = menghapus nomor WhatsApp.
        data.whatsapp = input.whatsapp === "" ? null : normalizeWhatsapp(input.whatsapp);
      }

      await updateUser(ctx.user.id, data);

      const updated = await findUserByUnionId(ctx.user.unionId);
      return {
        id: updated?.id ?? ctx.user.id,
        name: updated?.name ?? ctx.user.name,
        email: updated?.email ?? ctx.user.email,
        role: updated?.role ?? ctx.user.role,
        whatsapp: updated?.whatsapp ?? null,
      };
    }),

  register: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(255),
        email: z.string().trim().toLowerCase().email().max(320),
        password: z.string().min(8).max(255),
        noTelp: z.string().trim().min(8).max(20).optional(),
        turnstileToken: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Verifikasi keamanan Cloudflare Turnstile (anti-bot) — login/register.
      await verifyTurnstileToken(input.turnstileToken);

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
        turnstileToken: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Verifikasi keamanan Cloudflare Turnstile (anti-bot).
      await verifyTurnstileToken(input.turnstileToken);

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
