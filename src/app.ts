import { Hono } from "hono";
import { logger } from "hono/logger";
import { prisma } from "./middlewares/dbService.middleware";
import { AppBindings } from "./types";
import { envInjector } from "./middlewares/envInjector.middleware";
import userHandler from "./users/user.handler";
import { HTTPException } from "hono/http-exception";
import { NotFoundException } from "./libs/errors";
import userService from "./users/user.service";
import { WorkerEntrypoint } from "cloudflare:workers";

const app = new Hono<AppBindings>();

app.use(logger());

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.text(`Error ${error.status}: ${error.message}`);
  }
  return c.text(JSON.stringify(error.message));
});

app.notFound((c) => {
  throw new NotFoundException(`"${c.req.path}" not found`);
});

app.use(prisma());

app.use(envInjector());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/users", userHandler);

export default app;
