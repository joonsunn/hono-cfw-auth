import type { Token } from "@prisma/client";

export class TokenEntity implements Token {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  userId!: string;
  token!: string;
  refreshToken!: string;
}
