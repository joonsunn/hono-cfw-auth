import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";

export type NoteDb = Prisma.NoteDelegate<
  DefaultArgs,
  {
    adapter: PrismaNeon;
    log: "query"[] | undefined;
  }
>;

export const NoteIdSchema = z.object({
  id: z.string().uuid(),
});

export const CreateNoteSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  private: z.boolean().default(true),
});

export const UpdateNoteSchema = CreateNoteSchema.partial();

export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;

export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;
