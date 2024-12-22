import { TokenDb } from "./token.dto";

type TokenGetAllProps = {
  tokenDb: TokenDb;
  userId: string;
};

const getAll = async ({ tokenDb, userId }: TokenGetAllProps) => {
  return await tokenDb.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

type TokenGetPairProps = {
  tokenDb: TokenDb;
  tokenId: string;
};

const getPair = async ({ tokenDb, tokenId }: TokenGetPairProps) => {
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

const create = async ({ tokenDb, token, refreshToken, userId }: TokenCreateProps) => {
  const tokenPair = await tokenDb.create({
    data: {
      userId,
      token,
      refreshToken,
    },
  });

  return tokenPair;
};

type TokenUpdateProps = {
  tokenDb: TokenDb;
  tokenId: string;
  token: string;
  refreshToken: string;
};

const update = async ({ tokenDb, tokenId, token, refreshToken }: TokenUpdateProps) => {
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

const remove = async ({ tokenDb, tokenId }: TokenRemoveProps) => {
  return await tokenDb.delete({
    where: {
      id: tokenId,
    },
  });
};

type TokenPruneProps = {
  tokenDb: TokenDb;
  tokenIds: string[];
};

const prune = async ({ tokenDb, tokenIds }: TokenPruneProps) => {
  return await tokenDb.deleteMany({
    where: {
      id: {
        notIn: tokenIds,
      },
    },
  });
};

type TokenRemoveAllProps = {
  tokenDb: TokenDb;
  userId: string;
};

const removeAll = async ({ tokenDb, userId }: TokenRemoveAllProps) => {
  return await tokenDb.deleteMany({
    where: {
      userId,
    },
  });
};

type TokenResetTableProps = {
  tokenDb: TokenDb;
};

const resetTable = async ({ tokenDb }: TokenResetTableProps) => {
  return await tokenDb.deleteMany({});
};

export const tokenRepository = {
  getAll,
  getPair,
  create,
  update,
  remove,
  prune,
  removeAll,
  resetTable,
};

export default tokenRepository;

export type TokenRepository = typeof tokenRepository;
