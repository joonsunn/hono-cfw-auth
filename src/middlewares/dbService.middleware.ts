import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import type { AppBindings } from "../types";

export const prisma = (): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async (ctx, next) => {
    if (!ctx.get("prisma")) {
      const neon = new Pool({ connectionString: ctx.env.DATABASE_URL });
      const adapter = new PrismaNeon(neon);
      ctx.set("prisma", new PrismaClient({ adapter, log: ctx.env.MODE === "development" ? ["query"] : undefined }));
    }
    await next();
  });
