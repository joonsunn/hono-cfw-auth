import type { $Enums, User } from "@prisma/client";
import { TokenEntity } from "../tokens/token.entity";
import { NoteEntity } from "../notes/note.entity";

export class UserEntity implements User {
  id!: string;
  email!: string;
  hashedPassword!: string;
  role!: $Enums.ROLE;

  tokens?: TokenEntity[];
  notes?: NoteEntity[];
}
