import { Hono } from "hono";
import { logger } from "hono/logger";
import { prisma } from "./middlewares/dbService.middleware";
import { AppBindings } from "./types";
import { envInjector } from "./middlewares/envInjector.middleware";
import userHandler from "./users/user.handler";
import { HTTPException } from "hono/http-exception";
import { NotFoundException } from "./libs/errors";
import userRepository from "./users/user.repository";
import { dbService } from "./db/db.service";
import authHandler from "./auth/auth.handler";
import tokenRepository from "./tokens/token.repository";
import tokenHandler from "./tokens/token.handler";
import { authMiddleware } from "./middlewares/auth.middleware";
import { cors } from "hono/cors";
import noteHandler from "./notes/note.handler";
import noteRepository from "./notes/note.repository";

const app = new Hono<AppBindings>();
app.use(envInjector());
app.use(logger());
app.use("*", async (c, next) => {
  const allowedOrigins = [c.env.FRONTEND_URL ?? "*", c.env.FRONTEND_URL_2 ?? ""].filter((link) => link !== "");

  const corsMiddleware = cors({
    origin: ["http://localhost:3001", ...allowedOrigins],
    allowMethods: ["GET", "OPTIONS", "POST", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }
  return c.text(JSON.stringify(error.message));
});

app.notFound((c) => {
  throw new NotFoundException(`"${c.req.path}" not found`);
});

app.use(prisma());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", authHandler);
app.route("/tokens", tokenHandler);

// app.use(authMiddleware());
app.route("/users", userHandler);
app.route("/notes", noteHandler);

export default {
  fetch: app.fetch,

  async scheduled(controller: ScheduledController, env: AppBindings["Bindings"], ctx: ExecutionContext) {
    const db = dbService(env);
    const userDb = db.user;
    const tokenDb = db.token;
    const noteDb = db.note;

    switch (controller.cron) {
      case "0 0 * * *":
        // Every day 12am GMT+0
        console.log(`cron ${controller.cron} triggered at ${new Date(controller.scheduledTime).toISOString()}`);

        console.log(`resetting user table...`);
        console.log(await userRepository.resetTable(userDb));

        console.log(`resetting token table...`);
        console.log(await tokenRepository.resetTable({ tokenDb }));

        console.log(`resetting note table...`);
        console.log(await noteRepository.resetTable({ noteDb }));
    }
    console.log("cron processed");
  },
};
