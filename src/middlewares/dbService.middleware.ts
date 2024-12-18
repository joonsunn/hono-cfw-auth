import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, Pool } from "@neondatabase/serverless";
import type { AppBindings } from "../types";
import { drizzle as drizzleConnect } from "drizzle-orm/neon-http";
import { schema } from "../db/schema.drizzle";

export const prisma = (): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async (ctx, next) => {
    if (!ctx.get("prisma")) {
      const neon = new Pool({ connectionString: ctx.env.DATABASE_URL });
      const adapter = new PrismaNeon(neon);
      ctx.set("prisma", new PrismaClient({ adapter, log: ctx.env.MODE === "development" ? ["query"] : undefined }));
    }
    await next();
  });

export const drizzle = (): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async (ctx, next) => {
    if (!ctx.get("drizzle")) {
      const sql = neon(ctx.env.DATABASE_URL);
      const db = drizzleConnect(sql, { schema, logger: true });
      ctx.set("drizzle", db);
    }
    await next();
  });
