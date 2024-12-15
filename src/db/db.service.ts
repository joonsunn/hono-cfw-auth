import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { AppBindings } from "../types";

export const dbService = (env: AppBindings["Bindings"]) => {
  const neon = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaNeon(neon);
  const db = new PrismaClient({ adapter, log: env.MODE === "development" ? ["query"] : undefined });

  return db;
};
