import { AppError } from "../lib/error";
import { HttpStatus } from "../lib/enum";
import { NotificationModel } from "../models/notification.model";

export async function listUnreadNotifications() {
  try {
    const data = await NotificationModel.findAll({
      where: { is_read: false },
      order: [["created_at", "DESC"]],
    });
    return data;
  } catch (error) {
    throw new Error(
      `listUnreadNotifications failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function markNotificationRead(id: string) {
  try {
    const notification = await NotificationModel.findOne({ where: { id } });

    if (!notification) {
      throw new AppError("Notification not found", HttpStatus.NOT_FOUND);
    }

    await notification.update({ is_read: true, read_at: new Date() });

    return notification;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `markNotificationRead failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}
