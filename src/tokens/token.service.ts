import { sign, verify, decode } from "hono/jwt";
import { AppBindings } from "../types";
import { JwtDataDto, JwtDataSchema, JwtPayloadEntity, ResetTableDto, TokenDb } from "./token.dto";
import tokenRepository from "./token.repository";
import { compareHash, createHashedString } from "../libs/crypto";
import { UnauthorizedException } from "../libs/errors";
import { TokenType } from "./token.constants";

const getAll = async (tokenDb: TokenDb, userId: string) => {
  return await tokenRepository.getAll({ tokenDb, userId });
};

const getPair = async (tokenDb: TokenDb, tokenId: string) => {
  return await tokenRepository.getPair({ tokenDb, tokenId });
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

const update = async (tokenDb: TokenDb, tokenId: string, token: string, refreshToken: string) => {
  return await tokenRepository.update({ tokenDb, tokenId, token, refreshToken });
};

const remove = async (tokenDb: TokenDb, tokenId: string) => {
  return await tokenRepository.remove({ tokenDb, tokenId });
};

const removeAll = async (tokenDb: TokenDb, userId: string) => {
  return await tokenRepository.removeAll({ tokenDb, userId });
};

const resetTable = async (tokenDb: TokenDb, dto: ResetTableDto, env: AppBindings["Bindings"]) => {
  const approved = await compareHash(dto.adminSecret, env.JWT_SECRET as string);
  if (approved) {
    return await tokenRepository.resetTable({ tokenDb });
  } else {
    throw new UnauthorizedException("Unauthorized action detected. You will be reported.");
  }
};

const verifyToken = async (token: string, env: AppBindings["Bindings"], tokenType: TokenType) => {
  return (await verify(
    token,
    tokenType === TokenType.ACCESS ? env.JWT_SECRET : env.JWT_REFRESH_SECRET
  )) as JwtPayloadEntity;
};

const isTokenExpired = async (token: string, env: AppBindings["Bindings"], tokenType: TokenType) => {
  const { exp } = await verifyToken(token, env, tokenType);

  if (!exp) {
    throw new UnauthorizedException("Unauthorized action detected. You will be reported.");
  }

  return exp < Math.floor(Date.now() / 1000);
};

const decodeToken = (token: string) => {
  return decode(token);
};

const refreshTokens = async (tokenDb: TokenDb, tokenId: string, env: AppBindings["Bindings"], data: JwtDataDto) => {
  JwtDataSchema.parse(data);

  const { userId, role } = data;

  const payload = (expiry: number) => ({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + expiry,
  });

  const newToken = await sign(payload(env.JWT_EXPIRY), env.JWT_SECRET);
  const newRefreshToken = await sign(payload(env.JWT_REFRESH_EXPIRY), env.JWT_REFRESH_SECRET);

  return await tokenRepository.update({ tokenDb, tokenId, token: newToken, refreshToken: newRefreshToken });
};

export const tokenService = {
  getAll,
  getPair,
  create,
  update,
  remove,
  removeAll,
  resetTable,
  verifyToken,
  isTokenExpired,
  decodeToken,
  refreshTokens,
};

export default tokenService;

export type TokenService = typeof tokenService;
