import { PostProcessedCreateUserDtoType, PostProcessedUpdateUserDtoType, UserDb } from "./user.dto";
import { UserEntity } from "./user.entity";

const omit = {
  hashedPassword: true,
  totpSecret: true,
};

const getAll = async (userDb: UserDb) => {
  return (await userDb.findMany({ omit })) as UserEntity[];
};

const create = async (userDb: UserDb, dto: PostProcessedCreateUserDtoType) => {
  return await userDb.create({ data: dto, omit });
};

const findById = async (userDb: UserDb, id: string) => {
  return await userDb.findUnique({ where: { id }, omit });
};

const findByEmail = async (userDb: UserDb, email: string) => {
  return await userDb.findUnique({ where: { email }, omit });
};

const adminFindById = async (userDb: UserDb, id: string) => {
  return await userDb.findUnique({ where: { id } });
};

const adminFindByEmail = async (userDb: UserDb, email: string) => {
  return await userDb.findUnique({ where: { email } });
};

const update = async (userDb: UserDb, id: string, dto: PostProcessedUpdateUserDtoType) => {
  return await userDb.update({ where: { id }, data: dto, omit });
};

const remove = async (userDb: UserDb, id: string) => {
  return await userDb.delete({ where: { id }, omit });
};

const resetTable = async (userDb: UserDb) => {
  return await userDb.deleteMany({
    where: {
      email: { not: { in: ["admin@email.com"] } },
    },
  });
};

export const userRepository = {
  getAll,
  create,
  adminFindById,
  adminFindByEmail,
  findById,
  findByEmail,
  update,
  remove,
  resetTable,
};

export default userRepository;

export type UserRepository = typeof userRepository;
