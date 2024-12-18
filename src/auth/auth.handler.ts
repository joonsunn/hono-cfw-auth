import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppBindings } from "../types";
import { LoginDtoType, loginSchema } from "./auth.dto";
import { compareHash } from "../libs/crypto";
import userService from "../users/user.service";
import { UnauthorizedException } from "../libs/errors";

const authHandler = new Hono<AppBindings>();

authHandler.post("/login", zValidator("json", loginSchema), async ({ get, req, json, env }) => {
  const usersDb = get("prisma").user;

  const dto = (await req.json()) as LoginDtoType;
  const user = await userService.adminGetByEmail(usersDb, dto.email);

  const approved = await compareHash(dto.password, user.hashedPassword);
  if (!approved) {
    throw new UnauthorizedException("Invalid credentials");
  }

  return json({ email: user.email, role: user.role, message: "login successful" });
});

export default authHandler;
