import { compareHash } from "../libs/crypto";
import { BadRequestException, UnauthorizedException } from "../libs/errors";
import { TokenDb } from "../tokens/token.dto";
import tokenService from "../tokens/token.service";
import { AppBindings } from "../types";
import { UserDb } from "../users/user.dto";
import userService from "../users/user.service";
import { LoginDtoType } from "./auth.dto";

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

export const authService = {
  login,
  logout,
};

export default authService;

export type AuthService = typeof authService;
