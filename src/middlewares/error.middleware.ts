import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

type AppError = Error & {
  statusCode?: number;
  errorCode?: string;
  details?: unknown;
  code?: string;
  meta?: unknown;
};

const normalizeError = (err: AppError) => {
  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      details: err.issues,
    };
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Invalid or expired token",
      errorCode: "INVALID_TOKEN",
      details: null,
    };
  }

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      return {
        statusCode: 409,
        message: "Unique constraint failed",
        errorCode: "UNIQUE_CONSTRAINT_FAILED",
        details: err.meta ?? null,
      };
    }

    if (err.code === "P2025") {
      return {
        statusCode: 404,
        message: "Resource not found",
        errorCode: "RESOURCE_NOT_FOUND",
        details: err.meta ?? null,
      };
    }
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || "Internal server error",
    errorCode: err.errorCode || "INTERNAL_SERVER_ERROR",
    details: err.details || null,
  };
};

export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const normalized = normalizeError(err);

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    errorCode: normalized.errorCode,
    details: normalized.details,
  });
};