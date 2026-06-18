import { Router } from "express";
import {
  listUnreadNotificationsController,
  markNotificationReadController,
} from "../controllers/notification.controller";
import { validateRequest } from "../middleware";
import { markNotificationReadSchema } from "../schema";

const notificationRouter = Router();

notificationRouter.get("/unread", listUnreadNotificationsController);
notificationRouter.patch("/read", validateRequest(markNotificationReadSchema), markNotificationReadController);

export default notificationRouter;
