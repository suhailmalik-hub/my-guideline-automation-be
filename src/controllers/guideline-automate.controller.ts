import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";
import { guidelinePlayQueue, guidelineRunQueue } from "../queues";
import {
  confirmGuideline,
  createGuidelineAutomate,
  deleteGuidelineAutomate,
  detailGuidelineAutomate,
  getGuidelineDetail,
  listGuidelineAutomate,
  saveGuidelineAutomate,
  updateAutomationStep,
} from "../services";
import {
  ConfirmGuidelineRequest,
  CreateGuidelineAutomateRequest,
  DeleteGuidelineAutomateRequest,
  GuidelineDetailRequest,
  IPagination,
  PlayGuidelineAutomateRequest,
  RunGuidelineAutomateRequest,
  SaveGuidelineAutomateRequest,
  UpdateAutomationStepRequest,
} from "../types";

export const playGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const activeJobs = await guidelinePlayQueue.getActive();

    if (activeJobs.length >= 3) {
      throw new AppError(
        "Too many concurrent automation plays. Please try again later.",
        HttpStatus.BAD_REQUEST,
      );
    }

    // play asynchronously via queue to avoid request timeouts
    await guidelinePlayQueue.add(
      "play",
      req.body as unknown as PlayGuidelineAutomateRequest,
    );
    // const result = await playGuidelineAutomate(
    //   req.body as unknown as PlayGuidelineAutomateRequest,
    // );
    res.status(200).json({
      success: true,
      message: "Guideline automation played",
      // result: result,
    });
  } catch (err) {
    next(err);
  }
};

export const createGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await createGuidelineAutomate(
      req.body as unknown as CreateGuidelineAutomateRequest,
    );
    res.status(201).json({
      success: true,
      message: "Guideline automation created",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

export const saveGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await saveGuidelineAutomate(
      req.body as unknown as SaveGuidelineAutomateRequest,
    );
    res.status(200).json({
      success: true,
      message: "Guideline automation saved",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

export const runGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // const { guidelineId } = req.body as unknown as RunGuidelineAutomateRequest;

    const activeJobs = await guidelineRunQueue.getActive();

    if (activeJobs.length >= 3) {
      throw new AppError(
        "Too many concurrent automation runs. Please try again later.",
        HttpStatus.BAD_REQUEST,
      );
    }

    // run asynchronously via queue to avoid request timeouts
    await guidelineRunQueue.add(
      "run",
      req.body as unknown as RunGuidelineAutomateRequest,
    );
    // const result = await runGuidelineAutomate({ guidelineId });

    res.status(202).json({
      success: true,
      message: "Guideline automation started successfully",
      // result: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAutomationStepController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await updateAutomationStep(
      req.body as unknown as UpdateAutomationStepRequest,
    );
    res.status(200).json({
      success: true,
      message: "Automation step updated",
    });
  } catch (err) {
    next(err);
  }
};

export const detailGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await detailGuidelineAutomate(
      req.query as unknown as RunGuidelineAutomateRequest,
    );
    res.status(200).json({
      success: true,
      message: "Guideline automation detail",
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

export const listGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listGuidelineAutomate(
      req.body as unknown as IPagination,
    );
    res.status(200).json({
      success: true,
      message: "Guideline automations listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmGuidelineController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await confirmGuideline(
      req.body as unknown as ConfirmGuidelineRequest,
    );
    res.status(200).json({
      success: true,
      message: "Guideline confirmed",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGuidelineAutomateController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteGuidelineAutomate(
      req.query as unknown as DeleteGuidelineAutomateRequest,
    );
    res.status(200).json({
      success: true,
      message: "Guideline automation deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const guidelineDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await getGuidelineDetail(
      req.query as unknown as GuidelineDetailRequest,
    );
    res.status(200).json({
      success: true,
      message: "Guideline detail retrieved",
      data,
    });
  } catch (err) {
    next(err);
  }
};
