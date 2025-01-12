import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type LoginDtoType = z.infer<typeof loginSchema>;

export const totpLoginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "Invalid TOTP code" }),
});

export type TotpLoginDtoType = z.infer<typeof totpLoginSchema>;

export const TwoFaLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  code: z.string().length(6, { message: "Invalid TOTP code" }),
});

export type TwoFaLoginDtoType = z.infer<typeof TwoFaLoginSchema>;
