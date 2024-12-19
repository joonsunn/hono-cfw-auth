import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppBindings } from "../types";
import { LoginDtoType, loginSchema } from "./auth.dto";
import { compareHash, createHashedString } from "../libs/crypto";
import userService from "../users/user.service";
import { UnauthorizedException } from "../libs/errors";
import tokenService from "../tokens/token.service";
import authService from "./auth.service";
import { exampleMiddleware } from "../middlewares/example.miuddleware";

const authHandler = new Hono<AppBindings>();

authHandler.post(
  "/login",
  zValidator("json", loginSchema),
  exampleMiddleware("first"),
  exampleMiddleware("second"),
  async ({ get, req, json, env }) => {
    const usersDb = get("prisma").user;
    const tokenDb = get("prisma").token;

    const dto = (await req.json()) as LoginDtoType;

    return json(await authService.login({ usersDb, tokenDb, dto, env }));
  }
);

export default authHandler;
