import { PrismaClient } from "@prisma/client";
import { DrizzleClient } from "./db/db.drizzle.service";
import { Environment } from "./env";

export interface AppBindings {
  Bindings: Environment;
}

declare module "hono" {
  interface ContextVariableMap {
    prisma: PrismaClient;
    drizzle: DrizzleClient;
  }
}
