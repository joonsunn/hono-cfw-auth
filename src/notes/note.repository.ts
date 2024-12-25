import { AppBindings } from "../types";
import { CreateNoteDto, NoteDb, UpdateNoteDto } from "./note.dto";

type NoteGetAllProps = {
  noteDb: NoteDb;
  userId: string;
};

const getAllBySelf = async ({ noteDb, userId }: NoteGetAllProps) => {
  return await noteDb.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllByUserPublic = async ({ noteDb, userId }: NoteGetAllProps) => {
  return await noteDb.findMany({
    where: {
      userId,
      private: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

type NoteGetAllPublicNotesProps = {
  noteDb: NoteDb;
};

const getAllPublicNotes = async ({ noteDb }: NoteGetAllPublicNotesProps) => {
  return await noteDb.findMany({
    where: {
      private: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findOneById = async ({ noteDb, id }: { noteDb: NoteDb; id: string }) => {
  return await noteDb.findUnique({
    where: {
      id,
    },
  });
};

const create = async ({ noteDb, dto, userId }: { noteDb: NoteDb; dto: CreateNoteDto; userId: string }) => {
  return await noteDb.create({ data: { ...dto, userId } });
};

const update = async ({ noteDb, id, dto }: { noteDb: NoteDb; id: string; dto: UpdateNoteDto }) => {
  return await noteDb.update({ where: { id }, data: dto });
};

const remove = async ({ noteDb, id }: { noteDb: NoteDb; id: string }) => {
  return await noteDb.delete({ where: { id } });
};

const resetTable = async ({ noteDb }: { noteDb: NoteDb }) => {
  return await noteDb.deleteMany({});
};

export const noteRepository = {
  getAllBySelf,
  getAllByUserPublic,
  getAllPublicNotes,
  findOneById,
  create,
  update,
  remove,
  resetTable,
};

export default noteRepository;

export type NoteRepository = typeof noteRepository;
