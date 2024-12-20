import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppBindings } from "../types";
import { LoginDtoType, loginSchema } from "./auth.dto";
import { UnauthorizedException } from "../libs/errors";
import authService from "./auth.service";

const authHandler = new Hono<AppBindings>();

authHandler.post("/login", zValidator("json", loginSchema), async ({ get, req, json, env }) => {
  const usersDb = get("prisma").user;
  const tokenDb = get("prisma").token;

  const dto = (await req.json()) as LoginDtoType;

  return json(await authService.login({ usersDb, tokenDb, dto, env }));
});

authHandler.post("/logout", async ({ get, json, req }) => {
  const tokenDb = get("prisma").token;

  const bearerToken = req.header("Authorization");

  if (!bearerToken) {
    throw new UnauthorizedException("Credentials not found.");
  }

  const tokenId = bearerToken.replace("Bearer ", "");

  return json(await authService.logout({ tokenDb, tokenId }));
});

export default authHandler;
