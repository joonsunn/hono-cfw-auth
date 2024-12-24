import { $Enums } from "@prisma/client";
import { JwtPayloadEntity } from "../tokens/token.dto";

export const isOwnerCheck = (entity: { userId: string }, userId: string) => {
  if (entity.userId !== userId) {
    return false;
  }
  return true;
};

export const isAdminCheck = (user: JwtPayloadEntity) => {
  if (user.role !== $Enums.ROLE.ADMIN) {
    return false;
  }
  return true;
};
