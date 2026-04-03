export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}
