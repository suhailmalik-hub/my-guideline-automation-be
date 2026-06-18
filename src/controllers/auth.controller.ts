import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";

const STATIC_EMAIL = "admin@gmail.com";
const STATIC_PASSWORD = "admin@123";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (email !== STATIC_EMAIL || password !== STATIC_PASSWORD) {
      throw new AppError("Invalid email or password", HttpStatus.BAD_REQUEST);
    }

    const token = jwt.sign(
      { apiKey: process.env.API_KEY },
      process.env.JWT_SECRET!,
      {
        expiresIn: "8h",
      },
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Login successful",
      data: {
        email,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
