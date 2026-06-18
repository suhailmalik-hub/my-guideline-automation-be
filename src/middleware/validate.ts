import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";

const BODY_METHODS = ["POST", "PUT", "PATCH"];
const QUERY_METHODS = ["GET", "DELETE"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validate = (schema: ZodSchema, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      JSON.stringify(result.error.flatten().fieldErrors),
      HttpStatus.BAD_REQUEST,
    );
  }
  return true;
};

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const method = req.method.toUpperCase();

      if (BODY_METHODS.includes(method)) {
        validate(schema, req.body);
      } else if (QUERY_METHODS.includes(method)) {
        validate(schema, req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
