import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";

const API_KEY = process.env.API_KEY!;
const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateApiKey = () => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Missing or malformed Authorization header",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authHeader.slice(7);

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      if (decoded.apiKey !== API_KEY) {
        throw new AppError("Invalid API key in token", HttpStatus.UNAUTHORIZED);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError("Invalid or expired token", HttpStatus.UNAUTHORIZED));
      }
    }
  };
};
