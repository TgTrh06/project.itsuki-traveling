import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { isProduction } from "../config/env.js";
import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(message: string, public readonly statusCode = 500, public readonly code = "INTERNAL_ERROR", public readonly details?: unknown) {
    super(message);
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const multerError = error instanceof MulterError;
  const appError = error instanceof AppError ? error : undefined;
  const statusCode = multerError ? 400 : appError ? appError.statusCode : 500;
  const code = multerError ? "UPLOAD_ERROR" : appError ? appError.code : "INTERNAL_ERROR";
  const message = multerError
    ? error.code === "LIMIT_FILE_SIZE" ? "Uploaded file exceeds the allowed size." : error.message
    : appError ? appError.message : "An unexpected server error occurred.";

  logger.error("request_failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage: error instanceof Error ? error.message : String(error),
  });

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(appError?.details === undefined ? {} : { details: appError.details }),
    ...(!isProduction() && statusCode === 500 && error instanceof Error ? { stack: error.stack } : {}),
  });
};
