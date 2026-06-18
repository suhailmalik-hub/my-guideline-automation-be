import { NextFunction, Request, Response } from "express";
import {
  createVisaType,
  listAllVisaHierarchy,
  listSubVisaTypesByVisaType,
  listVisaTypesByDestination,
} from "../services/visa-type.service";
import {
  CreateVisaTypeRequest,
  ListSubVisaTypesByVisaTypeRequest,
  ListVisaTypesByDestinationRequest,
} from "../types/visa-type.types";

export const createVisaTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await createVisaType(
      req.body as unknown as CreateVisaTypeRequest,
    );
    res.status(201).json({
      success: true,
      message: "Visa type created",
    });
  } catch (err) {
    next(err);
  }
};

export const listVisaTypesByDestinationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listVisaTypesByDestination(
      req.query as unknown as ListVisaTypesByDestinationRequest,
    );
    res.status(200).json({
      success: true,
      message: "Visa types listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listSubVisaTypesByVisaTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listSubVisaTypesByVisaType(
      req.query as unknown as ListSubVisaTypesByVisaTypeRequest,
    );
    res.status(200).json({
      success: true,
      message: "Sub visa types listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listAllVisaHierarchyController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listAllVisaHierarchy();
    res.status(200).json({
      success: true,
      message: "Visa hierarchy listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};
