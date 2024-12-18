import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { AppBindings } from "../types";
import { schema } from "./schema.drizzle";

export const dbService = (env: AppBindings["Bindings"]) => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema, logger: true });

  return db;
};

export type DrizzleClient = ReturnType<typeof dbService>;
