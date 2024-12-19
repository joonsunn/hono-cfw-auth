import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";

export type TokenDb = Prisma.TokenDelegate<DefaultArgs, Prisma.PrismaClientOptions>;

export type JwtPayloadEntity = {
  sub: string;
  iat: number;
  exp: number;
};

export const JwtDataSchema = z.object({
  userId: z.string(),
  role: z.string(),
});

export type JwtDataDto = z.infer<typeof JwtDataSchema>;

export const resetTableSchema = z.object({
  adminSecret: z.string(),
});

export type ResetTableDto = z.infer<typeof resetTableSchema>;
