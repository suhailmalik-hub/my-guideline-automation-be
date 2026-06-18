import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";

export const authenticateSSE = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.query.apiKey === process.env.SSE_API_KEY) {
        next();
      } else {
        throw new AppError("Invalid SSE API key", HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      next(error);
    }
  };
};
