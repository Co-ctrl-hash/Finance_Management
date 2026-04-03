import { NextFunction, Request, Response } from "express";
import { loginSchema } from "./auth.validation";
import * as authService from "./auth.service";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: parsed.error.issues,
      });
    }

    const data = await authService.login(parsed.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
