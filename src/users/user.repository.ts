import { PostProcessedCreateUserDtoType, PostProcessedUpdateUserDtoType, UserDb } from "./user.dto";
import { UserEntity } from "./user.entity";

const getAll = async (userDb: UserDb) => {
  return (await userDb.findMany({ omit: { hashedPassword: true }, include: { token: true } })) as Partial<UserEntity>[];
};

const create = async (userDb: UserDb, dto: PostProcessedCreateUserDtoType) => {
  return await userDb.create({ data: dto, omit: { hashedPassword: true } });
};

const findById = async (userDb: UserDb, id: string) => {
  return await userDb.findUnique({ where: { id }, omit: { hashedPassword: true } });
};

const adminFindById = async (userDb: UserDb, id: string) => {
  return await userDb.findUnique({ where: { id } });
};

const update = async (userDb: UserDb, id: string, dto: PostProcessedUpdateUserDtoType) => {
  return await userDb.update({ where: { id }, data: dto, omit: { hashedPassword: true } });
};

const remove = async (userDb: UserDb, id: string) => {
  return await userDb.delete({ where: { id }, omit: { hashedPassword: true } });
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
  findById,
  update,
  remove,
  resetTable,
};

export default userRepository;

export type UserRepository = typeof userRepository;
