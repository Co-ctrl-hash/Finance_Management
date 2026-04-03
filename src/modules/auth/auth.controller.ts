import { Request, Response } from "express";
import { loginSchema } from "./auth.validation";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/async-handler";
import { validateSchema } from "../../utils/validation";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = validateSchema(loginSchema, req.body, "Validation failed", "VALIDATION_ERROR");

  const data = await authService.login(input);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data,
  });
});
