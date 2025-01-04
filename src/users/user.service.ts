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

const update = async (userDb: UserDb, id: string, dto: UpdateUserDtoType, env: AppBindings["Bindings"]) => {
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

  try {
    delete newDto.oldPassword;
    delete newDto.newPassword;
    delete newDto.newPasswordConfirm;
    delete newDto.adminSecret;
    return await userRepository.update(userDb, id, newDto);
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

export const userService = {
  getAll,
  getById,
  adminGetByEmail,
  create,
  update,
  remove,
  resetTable,
};

export default userService;

export type UserService = typeof userService;
