import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing",
        errorCode: "UNAUTHORIZED",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for token",
        errorCode: "UNAUTHORIZED",
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
        errorCode: "USER_INACTIVE",
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      errorCode: "INVALID_TOKEN",
    });
  }
};
