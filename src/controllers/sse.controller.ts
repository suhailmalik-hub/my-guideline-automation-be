import { Request, Response } from "express";
import { sseManager } from "../lib/sse/sse-manager";

export const sseConnectionController = (req: Request, res: Response): void => {
  const clientId = sseManager.addClient(res);

  req.on("close", () => {
    sseManager.removeClient(clientId);
  });
};
