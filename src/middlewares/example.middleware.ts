import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../types";

export const exampleMiddleware = (data: string): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async (c, next) => {
    console.log(`hello middleware data:${data}`);

    return next();
  });
