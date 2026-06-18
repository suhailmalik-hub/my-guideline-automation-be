import { NextFunction, Request, Response } from "express";
import {
  listUnreadNotifications,
  markNotificationRead,
} from "../services/notification.service";

export const listUnreadNotificationsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await listUnreadNotifications();
    res.status(200).json({
      success: true,
      message: "Unread notifications listed",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationReadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.body as { id: string };
    const data = await markNotificationRead(id);
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data,
    });
  } catch (err) {
    next(err);
  }
};
