import { Hono } from "hono";
import { AppBindings } from "../types";
import { zValidator } from "@hono/zod-validator";
import noteService from "./note.service";
import { CreateNoteDto, CreateNoteSchema, NoteIdSchema, UpdateNoteDto, UpdateNoteSchema } from "./note.dto";
import { authMiddleware } from "../middlewares/auth.middleware";

const noteHandler = new Hono<AppBindings>();

noteHandler.use(authMiddleware());

noteHandler.get("/bySelf", async ({ get, json }) => {
  const noteDb = get("prisma").note;
  const userId = get("user").sub;
  return json(await noteService.getAllBySelf(noteDb, userId));
});

noteHandler.get("/byUser/:id", async ({ get, json, req }) => {
  const noteDb = get("prisma").note;
  const userId = req.param("id");
  return json(await noteService.getAllByUserPublic(noteDb, userId));
});

noteHandler.post("", zValidator("json", CreateNoteSchema), async ({ get, json, req }) => {
  const noteDb = get("prisma").note;
  const userId = get("user").sub;
  const dto = (await req.json()) as CreateNoteDto;
  return json(await noteService.create(noteDb, dto, userId));
});

noteHandler.get(":id", zValidator("param", NoteIdSchema), async ({ get, json, req }) => {
  const noteDb = get("prisma").note;
  const user = get("user");
  const id = req.param("id");
  return json(await noteService.findOneById(noteDb, id, user));
});

noteHandler.patch(
  ":id",
  zValidator("param", NoteIdSchema),
  zValidator("json", UpdateNoteSchema),
  async ({ get, json, req }) => {
    const noteDb = get("prisma").note;
    const user = get("user");
    const id = req.param("id");
    const dto = (await req.json()) as UpdateNoteDto;
    return json(await noteService.update(noteDb, dto, id, user));
  }
);

noteHandler.delete(":id", zValidator("param", NoteIdSchema), async ({ get, json, req }) => {
  const noteDb = get("prisma").note;
  const user = get("user");
  const id = req.param("id");
  return json(await noteService.remove(noteDb, id, user));
});

export default noteHandler;

export type NoteHandler = typeof noteHandler;
