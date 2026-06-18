import { Router } from "express";
import { sseConnectionController } from "../controllers/sse.controller";
import {authenticateSSE } from "../middleware";

const router = Router();

router.get("/events", authenticateSSE(), sseConnectionController);

export default router;
