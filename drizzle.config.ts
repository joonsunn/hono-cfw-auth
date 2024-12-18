import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.drizzle.ts",
  out: "./drizzle",
  dialect: "postgresql",
} satisfies Config;
