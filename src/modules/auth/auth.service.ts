import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { LoginInput } from "./auth.validation";

export const login = async (payload: LoginInput) => {
  const email = payload.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatched = await comparePassword(payload.password, user.passwordHash);

  if (!passwordMatched) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status === "INACTIVE") {
    throw new AppError("User account is inactive", 403, "USER_INACTIVE");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};
