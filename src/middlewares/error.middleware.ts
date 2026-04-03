import { Request, Response, NextFunction } from "express";

type AppError = Error & {
  statusCode?: number;
  errorCode?: string;
  details?: unknown;
};

export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errorCode: err.errorCode || "INTERNAL_SERVER_ERROR",
    details: err.details || null,
  });
};