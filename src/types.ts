import { PrismaClient } from "@prisma/client";
import { Environment } from "./env";

export interface AppBindings {
  Bindings: Environment;
}

declare module "hono" {
  interface ContextVariableMap {
    prisma: PrismaClient;
  }
}
