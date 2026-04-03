import jwt, { SignOptions } from "jsonwebtoken";
import { Role, UserStatus } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "./app-error";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  if (!env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 500, "JWT_SECRET_MISSING");
  }

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  if (!env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 500, "JWT_SECRET_MISSING");
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string") {
    throw new AppError("Invalid token payload", 401, "INVALID_TOKEN");
  }

  return decoded as AccessTokenPayload;
};
