import { Router } from "express";
import { authenticateApiKey } from "../middleware/authenticate-api-key";
import authRouter from "./auth.routes";
import countryRouter from "./country.routes";
import guidelineAutomateRouter from "./guideline-automate.routes";
import healthRouter from "./health.routes";
import notificationRouter from "./notification.routes";
import sseRouter from "./sse.routes";
import visaTypeRouter from "./visa-type.routes";

const router = Router();

// Public routes
router.use("/auth", authRouter);
router.use("/sse", sseRouter);

// Protected routes — require a valid API key
router.use(authenticateApiKey());
router.use("/healthcheck", healthRouter);
router.use("/guidelineAutomate", guidelineAutomateRouter);
router.use("/visaType", visaTypeRouter);
router.use("/country", countryRouter);
router.use("/notification", notificationRouter);

export default router;
