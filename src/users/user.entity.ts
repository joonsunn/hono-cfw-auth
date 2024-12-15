import type { $Enums, User } from "@prisma/client";

export class UserEntity implements User {
  id!: string;
  email!: string;
  hashedPassword!: string;
  role!: $Enums.ROLE;
}
