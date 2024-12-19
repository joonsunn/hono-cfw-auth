import { Hono } from "hono";
import { AppBindings } from "../types";
import tokenService from "./token.service";
import { zValidator } from "@hono/zod-validator";
import { ResetTableDto, resetTableSchema } from "./token.dto";

const tokenHandler = new Hono<AppBindings>();

tokenHandler.post("/reset-table", zValidator("json", resetTableSchema), async ({ get, req, json, env }) => {
  const tokenDb = get("prisma").token;

  const dto = (await req.json()) as ResetTableDto;

  return json(await tokenService.resetTable(tokenDb, dto, env));
});

export default tokenHandler;

export type TokenHandler = typeof tokenHandler;
