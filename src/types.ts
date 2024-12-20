import { PrismaClient } from "@prisma/client";
import { Environment } from "./env";
import { JwtPayloadEntity } from "./tokens/token.dto";

export interface AppBindings {
  Bindings: Environment;
}

declare module "hono" {
  interface ContextVariableMap {
    prisma: PrismaClient;
    user: JwtPayloadEntity;
  }
}
