import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
// import userService from "./user.service.js";
import {
  CreateUserSchema,
  ResetTableDto,
  ResetTableSchema,
  UpdateUserDtoType,
  UpdateUserSchema,
  userParamSchema,
  type CreateUserDtoType,
} from "./user.dto.js";
import { AppBindings } from "../types.js";
import userService from "./user.service.js";

const userHandler = new Hono<AppBindings>();

userHandler.get("", async ({ get, json }) => {
  const userDb = get("drizzle").query.users;

  const allUsersWithTokens = await userDb.findMany({
    with: {
      tokens: true,
    },
    columns: {
      id: true,
      email: true,
      role: true,
    },
  });

  return json(allUsersWithTokens);

  // const usersDb = get("prisma").user;

  // return json(await userService.getAll(usersDb));
});

userHandler.post("", zValidator("json", CreateUserSchema), async ({ get, req, json, env }) => {
  const usersDb = get("prisma").user;

  const dto = (await req.json()) as CreateUserDtoType;

  return json(await userService.create(usersDb, dto, env));
});

userHandler.post("reset-table", zValidator("json", ResetTableSchema), async ({ get, req, json, env }) => {
  const usersDb = get("prisma").user;

  const dto = (await req.json()) as ResetTableDto;

  return json(await userService.resetTable(usersDb, dto, env));
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
