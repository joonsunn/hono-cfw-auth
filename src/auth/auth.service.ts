import { compareHash } from "../libs/crypto";
import { UnauthorizedException } from "../libs/errors";
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
    throw new UnauthorizedException("Invalid credentials");
  }

  const tokens = await tokenService.create(tokenDb, { userId: user.id, role: user.role }, env);

  return { email: user.email, role: user.role, ...tokens };
};

export const authService = {
  login,
};

export default authService;

export type AuthService = typeof authService;
