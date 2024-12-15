import { compare, hash } from "bcryptjs";

export async function createHashedString(input: string, rounds: number = 10) {
  return await hash(input, rounds);
}

export async function compareHash(input: string, storedData: string) {
  return await compare(input, storedData);
}
