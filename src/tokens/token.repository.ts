import { TokenDb } from "./token.dto";

type TokenGetAllProps = {
  tokenDb: TokenDb;
  userId: string;
};

export const getAll = async ({ tokenDb, userId }: TokenGetAllProps) => {
  return await tokenDb.findMany({
    where: {
      userId,
    },
  });
};

type TokenCreateProps = {
  tokenDb: TokenDb;
  token: string;
  refreshToken: string;
  userId: string;
};

export const create = async ({ tokenDb, token, refreshToken, userId }: TokenCreateProps) => {
  await tokenDb.create({
    data: {
      userId,
      token,
      refreshToken,
    },
  });

  return { token, refreshToken };
};

type TokenRemoveProps = {
  tokenDb: TokenDb;
  token: string;
};

export const remove = async ({ tokenDb, token }: TokenRemoveProps) => {
  await tokenDb.deleteMany({
    where: {
      token,
    },
  });

  return token;
};

type TokenRsetTableProps = {
  tokenDb: TokenDb;
};

export const resetTable = async ({ tokenDb }: TokenRsetTableProps) => {
  return await tokenDb.deleteMany({});
};

export const tokenRepository = {
  getAll,
  create,
  remove,
  resetTable,
};

export default tokenRepository;

export type TokenRepository = typeof tokenRepository;
