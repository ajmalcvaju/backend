import { Request, Response, NextFunction } from "express";

// Custom Error Handler Middleware
export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack); // Log error details in the console

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    success: false,
  });
}
