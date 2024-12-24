import { $Enums } from "@prisma/client";
import { NotFoundException, UnauthorizedException } from "../libs/errors";
import { JwtPayloadEntity } from "../tokens/token.dto";
import { CreateNoteDto, NoteDb, UpdateNoteDto } from "./note.dto";
import noteRepository from "./note.repository";
import { NoteEntity } from "./note.entity";
import { isAdminCheck, isOwnerCheck } from "../libs/utils";

const getAllBySelf = async (noteDb: NoteDb, userId: string) => {
  return await noteRepository.getAllBySelf({ noteDb, userId });
};

const getAllByUserPublic = async (noteDb: NoteDb, userId: string) => {
  return await noteRepository.getAllByUserPublic({ noteDb, userId });
};

const findOneById = async (noteDb: NoteDb, noteId: string, user: JwtPayloadEntity) => {
  const note = await noteRepository.findOneById({ noteDb, id: noteId });
  if (!note) {
    throw new NotFoundException(`Note with id ${noteId} not found`);
  }
  if (note.private) {
    isAllowedCheck(note, user);
  }

  return note;
};

const create = async (noteDb: NoteDb, dto: CreateNoteDto, userId: string) => {
  return await noteRepository.create({ noteDb, dto, userId });
};

const update = async (noteDb: NoteDb, dto: UpdateNoteDto, noteId: string, user: JwtPayloadEntity) => {
  const noteToBeUpdated = await findOneById(noteDb, noteId, user);
  isAllowedCheck(noteToBeUpdated, user);

  return await noteRepository.update({ noteDb, dto, id: noteId });
};

const remove = async (noteDb: NoteDb, noteId: string, user: JwtPayloadEntity) => {
  const noteToBeDeleted = await findOneById(noteDb, noteId, user);
  isAllowedCheck(noteToBeDeleted, user);

  return await noteRepository.remove({ noteDb, id: noteId });
};

const isAllowedCheck = (note: NoteEntity, user: JwtPayloadEntity) => {
  if (!isOwnerCheck(note, user.sub) && !isAdminCheck(user)) {
    throw new UnauthorizedException("Unauthorized action detected. You will be reported.");
  }
  return;
};

export const noteService = {
  getAllBySelf,
  getAllByUserPublic,
  findOneById,
  create,
  update,
  remove,
};

export default noteService;

export type NoteService = typeof noteService;
