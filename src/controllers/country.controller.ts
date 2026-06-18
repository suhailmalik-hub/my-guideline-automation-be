import { NextFunction, Request, Response } from "express";
import { listDestinationCountries, listWorldCountries } from "../services/country.service";

export const listWorldCountriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listWorldCountries();
    res.status(200).json({
      success: true,
      message: "World countries listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listDestinationCountriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listDestinationCountries();
    res.status(200).json({
      success: true,
      message: "Destination countries listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};
