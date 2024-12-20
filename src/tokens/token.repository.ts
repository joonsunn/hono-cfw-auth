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

type TokenGetPairProps = {
  tokenDb: TokenDb;
  tokenId: string;
};

export const getPair = async ({ tokenDb, tokenId }: TokenGetPairProps) => {
  return await tokenDb.findFirst({
    where: {
      id: tokenId,
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
  const tokenPair = await tokenDb.create({
    data: {
      userId,
      token,
      refreshToken,
    },
  });

  return tokenPair.id;
};

type TokenUpdateProps = {
  tokenDb: TokenDb;
  tokenId: string;
  token: string;
  refreshToken: string;
};

export const update = async ({ tokenDb, tokenId, token, refreshToken }: TokenUpdateProps) => {
  return await tokenDb.update({
    where: {
      id: tokenId,
    },
    data: {
      token,
      refreshToken,
    },
  });
};

type TokenRemoveProps = {
  tokenDb: TokenDb;
  tokenId: string;
};

export const remove = async ({ tokenDb, tokenId }: TokenRemoveProps) => {
  return await tokenDb.delete({
    where: {
      id: tokenId,
    },
  });
};

type TokenRemoveAllProps = {
  tokenDb: TokenDb;
  userId: string;
};

export const removeAll = async ({ tokenDb, userId }: TokenRemoveAllProps) => {
  return await tokenDb.deleteMany({
    where: {
      userId,
    },
  });
};

type TokenResetTableProps = {
  tokenDb: TokenDb;
};

export const resetTable = async ({ tokenDb }: TokenResetTableProps) => {
  return await tokenDb.deleteMany({});
};

export const tokenRepository = {
  getAll,
  getPair,
  create,
  update,
  remove,
  removeAll,
  resetTable,
};

export default tokenRepository;

export type TokenRepository = typeof tokenRepository;
