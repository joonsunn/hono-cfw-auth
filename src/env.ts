import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default("*"),
  FRONTEND_URL_2: z.string().optional(),
  ADMIN_SIGNUP_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  MODE: z.string().default("development"),
  JWT_SECRET: z.string().default("secret"),
  JWT_EXPIRY: z.coerce.number().default(300),
  JWT_REFRESH_SECRET: z.string().default("secret"),
  JWT_REFRESH_EXPIRY: z.coerce.number().default(3000),
  MAX_TOKENS_PER_USER: z.coerce.number().default(3),
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
