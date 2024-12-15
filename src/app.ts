import { Hono } from "hono";
import { logger } from "hono/logger";
import { prisma } from "./middlewares/dbService.middleware";
import { AppBindings } from "./types";
import { envInjector } from "./middlewares/envInjector.middleware";
import userHandler from "./users/user.handler";
import { HTTPException } from "hono/http-exception";
import { NotFoundException } from "./libs/errors";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import userService from "./users/user.service";
import userRepository from "./users/user.repository";

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

export default {
  fetch: app.fetch,

  async scheduled(controller: ScheduledController, env: AppBindings["Bindings"], ctx: ExecutionContext) {
    // Write code for updating your API
    const neon = new Pool({ connectionString: env.DATABASE_URL });
    const adapter = new PrismaNeon(neon);
    const dbService = new PrismaClient({ adapter, log: env.MODE === "development" ? ["query"] : undefined });
    const userDb = dbService.user;

    switch (controller.cron) {
      case "0 0 * * *":
        // Every day 12am GMT+0
        await userRepository.resetTable(userDb);

      case "*/10 * * * *":
        // Every 10 mins
        const users = await userRepository.getAll(userDb);
        console.log(users);
    }
    console.log("cron processed");
  },
};
