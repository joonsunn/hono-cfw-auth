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
import { exampleMiddleware } from "../middlewares/example.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getCookie } from "hono/cookie";
import { UnauthorizedException } from "../libs/errors.js";
import authService from "../auth/auth.service.js";

// /users
const userHandler = new Hono<AppBindings>();

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

userHandler.get("byEmail/:email", async ({ get, req, json }) => {
  const usersDb = get("prisma").user;
  const email = req.param("email");
  return json(await userService.getByEmail(usersDb, email));
});

userHandler.use(authMiddleware());

userHandler.get("", async ({ get, json }) => {
  const usersDb = get("prisma").user;

  const user = get("user");
  console.log("current user performing action: ", user);

  return json(await userService.getAll(usersDb));
});

userHandler.use(exampleMiddleware("colocated-middleware in userHandler for get user by id"));

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

userHandler.get(":id/totpQr", async (c) => {
  const { get, json } = c;
  const userId = get("user").sub;
  return json(await userService.retrieveTotpQr({ usersDb: get("prisma").user, userId }));
});

userHandler.post("/verify-totp", async (c) => {
  const { get, req, json, env } = c;

  const usersDb = get("prisma").user;

  const dto = await req.json();

  const userId = get("user").sub;

  const response = await authService.verifyTotp({ usersDb, userId, code: dto.code });

  await userService.update(usersDb, userId, { totpVerified: true }, env);

  return json(response);
});

export default userHandler;
