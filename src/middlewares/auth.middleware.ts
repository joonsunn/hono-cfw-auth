import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../types";
import { UnauthorizedException } from "../libs/errors";
import tokenService from "../tokens/token.service";
import { TokenType } from "../tokens/token.constants";

export const authMiddleware = (): MiddlewareHandler<AppBindings> =>
  createMiddleware<AppBindings>(async ({ req, env, get, set }, next) => {
    const bearerToken = req.header("Authorization");

    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      throw new UnauthorizedException("Credentials not found.");
    }

    const tokenId = bearerToken.replace("Bearer ", "");

    const tokenDb = get("prisma").token;

    const tokenPair = await tokenService.getPair(tokenDb, tokenId);

    if (!tokenPair) {
      throw new UnauthorizedException("Credentials not found.");
    }

    try {
      const verifyAccessToken = await tokenService.verifyToken(tokenPair.token, env, TokenType.ACCESS);

      set("user", verifyAccessToken);

      return next();
    } catch (error) {
      console.log("access token expired. Verifying refresh token...");

      try {
        const verifyRefreshToken = await tokenService.verifyToken(tokenPair.refreshToken, env, TokenType.REFRESH);
        console.log("Refresh token verified. Refreshing token pair...");

        await tokenService.refreshTokens(tokenDb, tokenPair.id, env, {
          userId: verifyRefreshToken.sub,
          role: verifyRefreshToken.role,
        });
        set("user", verifyRefreshToken);

        console.log("refreshed token pairs");
        return next();
      } catch (error) {
        console.log("refresh token expired. Removing stale token pairs...");
        await tokenService.remove(tokenDb, tokenPair.id);
        throw new UnauthorizedException("Session expired");
      }
    }
  });
