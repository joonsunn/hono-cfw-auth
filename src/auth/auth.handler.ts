import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppBindings } from "../types";
import {
  LoginDtoType,
  loginSchema,
  TotpLoginDtoType,
  totpLoginSchema,
  TwoFaLoginDtoType,
  TwoFaLoginSchema,
} from "./auth.dto";
import { UnauthorizedException } from "../libs/errors";
import authService from "./auth.service";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const authHandler = new Hono<AppBindings>();

authHandler.post("/login", zValidator("json", loginSchema), async (c) => {
  const { get, req, json, env } = c;

  const usersDb = get("prisma").user;
  const tokenDb = get("prisma").token;

  const dto = (await req.json()) as LoginDtoType;

  const returnObject = await authService.login({ usersDb, tokenDb, dto, env });
  setCookie(c, "token", returnObject.tokenId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
  });
  return json(returnObject);
});

authHandler.post("/totp-login", zValidator("json", totpLoginSchema), async (c) => {
  const { get, req, json, env } = c;

  const usersDb = get("prisma").user;
  const tokenDb = get("prisma").token;

  const dto = (await req.json()) as TotpLoginDtoType;

  const returnObject = await authService.totpLogin({ usersDb, tokenDb, dto, env });
  setCookie(c, "token", returnObject.tokenId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
  });
  return json(returnObject);
});

authHandler.post("/twoFa-login", zValidator("json", TwoFaLoginSchema), async (c) => {
  const { get, req, json, env } = c;

  const usersDb = get("prisma").user;
  const tokenDb = get("prisma").token;

  const dto = (await req.json()) as TwoFaLoginDtoType;

  const returnObject = await authService.twoFaLogin({ usersDb, tokenDb, dto, env });
  setCookie(c, "token", returnObject.tokenId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
  });
  return json(returnObject);
});

authHandler.post("/logout", async (c) => {
  const { get, req, json, env } = c;

  const tokenDb = get("prisma").token;

  const bearerToken = req.header("Authorization");

  const cookieToken = getCookie(c, "token");

  if (!bearerToken && !cookieToken) {
    throw new UnauthorizedException("Credentials not found.");
  }

  const tokenId = bearerToken?.replace("Bearer ", "") || (cookieToken as string);

  const returnObject = await authService.logout({ tokenDb, tokenId });

  deleteCookie(c, "token");

  return json(returnObject);
});

export default authHandler;
