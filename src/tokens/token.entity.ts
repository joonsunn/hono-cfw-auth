import type { Token } from "@prisma/client";
import { UserEntity } from "../users/user.entity";

export class TokenEntity implements Token {
  id!: string;
  createdAt!: Date;
  userId!: string;

  user?: UserEntity;
}
