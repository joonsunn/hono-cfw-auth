import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
// import userService from "./user.service.js";
import {
  CreateUserSchema,
  UpdateUserDtoType,
  UpdateUserSchema,
  userParamSchema,
  type CreateUserDtoType,
} from "./user.dto.js";
import { AppBindings } from "../types.js";
import userService from "./user.service.js";

const userHandler = new Hono<AppBindings>();

userHandler.get("", async ({ get, json }) => {
  const usersDb = get("prisma").user;

  return json(await userService.getAll(usersDb));
});

userHandler.post("", zValidator("json", CreateUserSchema), async ({ get, req, json, env }) => {
  const usersDb = get("prisma").user;

  const dto = (await req.json()) as CreateUserDtoType;

  return json(await userService.create(usersDb, dto, env));
});

userHandler.get(":id", zValidator("param", userParamSchema), async ({ get, req, json }) => {
  const usersDb = get("prisma").user;
  const id = req.param("id");
  return json(await userService.getById(usersDb, id));
});

userHandler.patch(
  ":id",
  zValidator("param", userParamSchema),
  zValidator("json", UpdateUserSchema),
  async ({ get, req, json, env }) => {
    const usersDb = get("prisma").user;
    const id = req.param("id");
    const dto = (await req.json()) as UpdateUserDtoType;

    return json(await userService.update(usersDb, id, dto, env));
  }
);

userHandler.delete(":id", zValidator("param", userParamSchema), async ({ get, req, json }) => {
  const usersDb = get("prisma").user;
  const id = req.param("id");
  return json(await userService.remove(usersDb, id));
});

export default userHandler;
