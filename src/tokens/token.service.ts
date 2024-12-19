import { sign, verify, decode } from "hono/jwt";
import { AppBindings } from "../types";
import { JwtDataDto, JwtDataSchema, ResetTableDto, TokenDb } from "./token.dto";
import tokenRepository from "./token.repository";
import { compareHash } from "../libs/crypto";
import { UnauthorizedException } from "../libs/errors";

const getAll = async (tokenDb: TokenDb, userId: string) => {
  return await tokenRepository.getAll({ tokenDb, userId });
};

const create = async (tokenDb: TokenDb, data: JwtDataDto, env: AppBindings["Bindings"]) => {
  JwtDataSchema.parse(data);

  const { userId, role } = data;

  const payload = (expiry: number) => ({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + expiry,
  });

  const token = await sign(payload(env.JWT_EXPIRY), env.JWT_SECRET);
  const refreshToken = await sign(payload(env.JWT_REFRESH_EXPIRY), env.JWT_REFRESH_SECRET);

  return await tokenRepository.create({ tokenDb, token, refreshToken, userId });
};

const remove = async (tokenDb: TokenDb, token: string) => {
  return await tokenRepository.remove({ tokenDb, token });
};

const resetTable = async (tokenDb: TokenDb, dto: ResetTableDto, env: AppBindings["Bindings"]) => {
  const approved = await compareHash(dto.adminSecret, env.JWT_SECRET as string);
  if (approved) {
    return await tokenRepository.resetTable({ tokenDb });
  } else {
    throw new UnauthorizedException("Unauthorized action detected. You will be reported.");
  }
};

const verifyToken = async (token: string, env: AppBindings["Bindings"]) => {
  return await verify(token, env.JWT_SECRET);
};

const decodeToken = (token: string) => {
  return decode(token);
};

export const tokenService = {
  getAll,
  create,
  remove,
  resetTable,
  verifyToken,
  decodeToken,
};

export default tokenService;

export type TokenService = typeof tokenService;
