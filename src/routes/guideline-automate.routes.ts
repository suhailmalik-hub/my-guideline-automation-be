import { Router } from "express";
import {
  confirmGuidelineController,
  createGuidelineAutomateController,
  deleteGuidelineAutomateController,
  detailGuidelineAutomateController,
  guidelineDetailController,
  listGuidelineAutomateController,
  playGuidelineAutomateController,
  runGuidelineAutomateController,
  saveGuidelineAutomateController,
  updateAutomationStepController,
} from "../controllers";
import { validateRequest } from "../middleware";
import {
  confirmGuidelineSchema,
  createGuidelineAutomateSchema,
  deleteGuidelineAutomateSchema,
  detailGuidelineAutomateSchema,
  guidelineDetailSchema,
  listGuidelineAutomateSchema,
  playGuidelineAutomateSchema,
  runGuidelineAutomateSchema,
  saveGuidelineAutomateSchema,
  updateAutomationStepSchema,
} from "../schema";

const router = Router();

router.post(
  "/create",
  validateRequest(createGuidelineAutomateSchema),
  createGuidelineAutomateController,
);
router.post(
  "/play",
  validateRequest(playGuidelineAutomateSchema),
  playGuidelineAutomateController,
);
router.post(
  "/save",
  validateRequest(saveGuidelineAutomateSchema),
  saveGuidelineAutomateController,
);
router.patch(
  "/update-automation-step",
  validateRequest(updateAutomationStepSchema),
  updateAutomationStepController,
);
router.post(
  "/run",
  validateRequest(runGuidelineAutomateSchema),
  runGuidelineAutomateController,
);
router.get(
  "/detail",
  validateRequest(detailGuidelineAutomateSchema),
  detailGuidelineAutomateController,
);
router.post(
  "/list",
  validateRequest(listGuidelineAutomateSchema),
  listGuidelineAutomateController,
);
router.patch(
  "/confirmGuideline",
  validateRequest(confirmGuidelineSchema),
  confirmGuidelineController,
);
router.delete(
  "/delete",
  validateRequest(deleteGuidelineAutomateSchema),
  deleteGuidelineAutomateController,
);
router.get(
  "/guidelineDetail",
  validateRequest(guidelineDetailSchema),
  guidelineDetailController,
);

export default router;
