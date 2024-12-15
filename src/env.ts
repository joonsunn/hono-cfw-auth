import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  ADMIN_SIGNUP_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  MODE: z.string().default("development"),
});

export type Environment = z.infer<typeof envSchema>;

export function getEnv(data: any) {
  const { data: env, error } = envSchema.safeParse(data);

  if (error) {
    const errorMessage = JSON.stringify(error, null, 2);
    console.log(errorMessage);
    throw new Error(errorMessage);
  }
  return env;
}
