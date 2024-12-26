import { Note } from "@prisma/client";
import { UserEntity } from "../users/user.entity";

export class NoteEntity implements Note {
  id!: string;
  title!: string;
  content!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  private!: boolean;
  userId!: string;

  user?: UserEntity;
}
