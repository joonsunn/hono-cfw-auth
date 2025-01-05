import { compareHash } from "../libs/crypto";
import { BadRequestException, UnauthorizedException } from "../libs/errors";
import qrService from "../qr/qr.service";
import { TokenDb } from "../tokens/token.dto";
import tokenService from "../tokens/token.service";
import { AppBindings } from "../types";
import { UpdateUserDtoType, UserDb } from "../users/user.dto";
import userService from "../users/user.service";
import { LoginDtoType, TotpLoginDtoType } from "./auth.dto";
import { authenticator } from "otplib";

type LoginProps = {
  usersDb: UserDb;
  tokenDb: TokenDb;
  dto: LoginDtoType;
  env: AppBindings["Bindings"];
};

export const login = async ({ usersDb, tokenDb, dto, env }: LoginProps) => {
  const user = await userService.adminGetByEmail(usersDb, dto.email);

  const approved = await compareHash(dto.password, user.hashedPassword);
  if (!approved) {
    throw new BadRequestException("Invalid credentials");
  }

  const tokenId = await tokenService.create(tokenDb, { userId: user.id, role: user.role }, env);

  return { id: user.id, email: user.email, role: user.role, tokenId };
};

type totpLoginProps = {
  usersDb: UserDb;
  tokenDb: TokenDb;
  dto: TotpLoginDtoType;
  env: AppBindings["Bindings"];
};

export const totpLogin = async ({ usersDb, tokenDb, dto, env }: totpLoginProps) => {
  const user = await userService.adminGetByEmail(usersDb, dto.email);

  const approved = await authService.verifyTotp({ usersDb, userId: user.id, code: dto.code });
  if (!approved) {
    throw new BadRequestException("Invalid credentials");
  }

  const tokenId = await tokenService.create(tokenDb, { userId: user.id, role: user.role }, env);

  return { id: user.id, email: user.email, role: user.role, tokenId };
};

export const logout = async ({ tokenDb, tokenId }: { tokenDb: TokenDb; tokenId: string }) => {
  const existingPair = await tokenService.getPair(tokenDb, tokenId);
  if (!existingPair) {
    throw new UnauthorizedException("Credentials not found.");
  }
  return await tokenService.remove(tokenDb, tokenId);
};

export const logoutAll = async ({ tokenDb, userId }: { tokenDb: TokenDb; userId: string }) => {
  return await tokenService.removeAll(tokenDb, userId);
};

export const generateTotpSecret = async ({
  usersDb,
  userId,
  env,
}: {
  usersDb: UserDb;
  userId: string;
  env: AppBindings["Bindings"];
}) => {
  const user = await userService.getById(usersDb, userId);
  const totpSecret = authenticator.generateSecret();
  return await userService.update(usersDb, user.id, { totpSecret }, env);
};

export const verifyTotp = async ({ usersDb, userId, code }: { usersDb: UserDb; userId: string; code: string }) => {
  const userById = await userService.getById(usersDb, userId);
  const user = await userService.adminGetByEmail(usersDb, userById.email);

  if (!user.totpSecret || !user.totpEnabled) {
    throw new BadRequestException(`Totp not applicable for user ${user.email}`);
  }

  const isValid = authenticator.verify({
    token: code,
    secret: user.totpSecret,
  });

  if (!isValid) {
    throw new BadRequestException("Invalid code");
  } else {
    return true;
  }
};

export const authService = {
  login,
  logout,
  generateTotpSecret,
  verifyTotp,
  totpLogin,
};

export default authService;

export type AuthService = typeof authService;
