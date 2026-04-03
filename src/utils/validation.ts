import { z } from "zod";
import { AppError } from "./app-error";

type ValidationErrorCode = "VALIDATION_ERROR" | "INVALID_QUERY";

export const validateSchema = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
  message: string,
  errorCode: ValidationErrorCode
): T => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(message, 400, errorCode, parsed.error.issues);
  }

  return parsed.data;
};
