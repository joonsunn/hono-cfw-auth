import type { $Enums, Token, User } from "@prisma/client";
import { TokenEntity } from "../tokens/token.entity";

export class UserEntity implements User {
  id!: string;
  email!: string;
  hashedPassword!: string;
  role!: $Enums.ROLE;

  tokens?: TokenEntity[];
}
