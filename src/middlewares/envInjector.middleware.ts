import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../types";
import { getEnv } from "../env";

export const envInjector = (): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async (c, next) => {
    try {
      c.env = getEnv(Object.assign(c.env || {}, process.env));
    } catch (error) {
      return c.json(JSON.stringify(error));
    }

    return next();
  });
