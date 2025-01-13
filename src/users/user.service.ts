import { $Enums } from "@prisma/client";
import { createHashedString, compareHash } from "../libs/crypto";
import { AppBindings } from "../types";
import {
  CreateUserDtoType,
  PostProcessedUpdateUserDtoType,
  ResetTableDto,
  UpdateUserDtoType,
  UserDb,
} from "./user.dto";
import userRepository from "./user.repository";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../libs/errors";
import authService from "../auth/auth.service";
import { ResponseUserType, UserEntity } from "./user.entity";
import { authenticator } from "otplib";
import qrService from "../qr/qr.service";

const getAll = async (userDb: UserDb) => {
  return await userRepository.getAll(userDb);
};

const getById = async (userDb: UserDb, id: string) => {
  const user = await userRepository.findById(userDb, id);
  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }
  return user;
};

const getByEmail = async (userDb: UserDb, email: string) => {
  const user = await userRepository.findByEmail(userDb, email);
  if (!user) {
    throw new NotFoundException(`User with email ${email} not found`);
  }
  return user;
};

const adminGetById = async (userDb: UserDb, id: string) => {
  const user = await userRepository.adminFindById(userDb, id);
  if (!user) {
    throw new NotFoundException(`User with id ${id} not found`);
  }
  return user;
};

const adminGetByEmail = async (userDb: UserDb, email: string) => {
  const user = await userRepository.adminFindByEmail(userDb, email);
  if (!user) {
    throw new NotFoundException(`User with email ${email} not found`);
  }
  return user;
};

const create = async (userDb: UserDb, dto: CreateUserDtoType, env: AppBindings["Bindings"]) => {
  const newDto = {
    ...dto,
    password: undefined,
    hashedPassword: await createHashedString(dto.password),
    role: (await assignRoleBasedOnSecret(dto.adminSecret, env.ADMIN_SIGNUP_SECRET)) ?? "USER",
    adminSecret: undefined,
  };

  try {
    return await userRepository.create(userDb, newDto);
  } catch (error) {
    throw new BadRequestException(`Bad request: ${JSON.stringify(error, null, 2)}`);
  }
};

const update = async (
  userDb: UserDb,
  id: string,
  dto: UpdateUserDtoType,
  env: AppBindings["Bindings"]
): Promise<ResponseUserType> => {
  const existingUser = await adminGetById(userDb, id);

  const newDto = {
    ...dto,
  } as PostProcessedUpdateUserDtoType & UpdateUserDtoType;

  if (dto.oldPassword) {
    if (!dto.oldPassword || !(await compareHash(dto.oldPassword, existingUser.hashedPassword))) {
      throw new BadRequestException("Invalid credentials provided. Unable to proceed with user update.");
    }
    if (dto.newPassword) {
      if (dto.newPassword !== dto.newPasswordConfirm) {
        throw new BadRequestException("New password and confirm password do not match");
      }
      newDto.hashedPassword = await createHashedString(dto.newPassword);
    }
  }

  if (dto.role && dto.role !== existingUser.role) {
    newDto.role = (await assignRoleBasedOnSecret(newDto.adminSecret, env.ADMIN_SIGNUP_SECRET)) ?? "USER";
  }

  if (existingUser.totpEnabled === true && newDto.totpEnabled === false) {
    newDto.totpSecret = null;
    newDto.totpVerified = false;
  }

  try {
    delete newDto.oldPassword;
    delete newDto.newPassword;
    delete newDto.newPasswordConfirm;
    delete newDto.adminSecret;

    await userRepository.update(userDb, id, newDto);

    if (existingUser.totpEnabled !== newDto.totpEnabled && newDto.totpEnabled) {
      await authService.generateTotpSecret({ usersDb: userDb, userId: id, env });
    }

    return await getById(userDb, id);
  } catch (error) {
    throw new BadRequestException(`Bad request: ${JSON.stringify(error, null, 2)}`);
  }
};

const remove = async (userDb: UserDb, id: string) => {
  await getById(userDb, id);

  return await userRepository.remove(userDb, id);
};

const assignRoleBasedOnSecret = async (input: string | undefined, hashedSecret: string | undefined) => {
  if (input && hashedSecret) {
    return (await compareHash(input, hashedSecret)) ? $Enums.ROLE.ADMIN : $Enums.ROLE.USER;
  } else {
    return undefined;
  }
};

const resetTable = async (userDb: UserDb, dto: ResetTableDto, env: AppBindings["Bindings"]) => {
  const approved = await compareHash(dto.adminSecret, env.ADMIN_SIGNUP_SECRET as string);
  if (approved) {
    return await userRepository.resetTable(userDb);
  } else {
    throw new UnauthorizedException("Unauthorized action detected. You will be reported.");
  }
};

export const retrieveTotpQr = async ({ usersDb, userId }: { usersDb: UserDb; userId: string }) => {
  const service = "hono-app";

  const userById = await userService.getById(usersDb, userId);
  const user = await userService.adminGetByEmail(usersDb, userById.email);
  if (!user.totpSecret) {
    throw new BadRequestException(`Totp not applicable for user ${user.email}`);
  }
  const otpauth = authenticator.keyuri(user.email, service, user.totpSecret);

  const qrUri = await qrService.generateQrUri(otpauth);

  const dataToReturn = {
    qr: qrUri,
    totpSecret: user.totpSecret,
  };

  return dataToReturn;
};

export const userService = {
  getAll,
  getById,
  getByEmail,
  adminGetByEmail,
  create,
  update,
  remove,
  resetTable,
  retrieveTotpQr,
};

export default userService;

export type UserService = typeof userService;
