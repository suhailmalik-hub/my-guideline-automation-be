import { Request, Response } from "express";
import db from "../lib/connections/db-connection/db.connection";

export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    await db.authenticate();

    res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "disconnected",
      },
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
