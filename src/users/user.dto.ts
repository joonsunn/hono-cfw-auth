import { z } from "zod";
import { $Enums, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.nativeEnum($Enums.ROLE).optional(),
  adminSecret: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  previousPassword: z.string().optional(),
  password: z.string().optional(),
  role: z.nativeEnum($Enums.ROLE).optional(),
  adminSecret: z.string().optional(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserSchema>;

export type PostProcessedCreateUserDtoType = Omit<CreateUserDtoType, "password"> & {
  hashedPassword: string;
  role: $Enums.ROLE;
};

export type UpdateUserDtoType = z.infer<typeof UpdateUserSchema>;

export type PostProcessedUpdateUserDtoType = Partial<
  Omit<UpdateUserDtoType, "password" | "previousPassword"> & {
    hashedPassword: string;
    role: $Enums.ROLE;
  }
>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginDtoType = z.infer<typeof LoginSchema>;

export type UserDb = Prisma.UserDelegate<DefaultArgs, Prisma.PrismaClientOptions>;

export const userParamSchema = z.object({
  id: z.string().uuid(),
});

export const ResetTableSchema = z.object({
  adminSecret: z.string(),
});

export type ResetTableDto = z.infer<typeof ResetTableSchema>;
