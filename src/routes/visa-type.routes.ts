import { Router } from "express";
import {
  createVisaTypeController,
  listAllVisaHierarchyController,
  listSubVisaTypesByVisaTypeController,
  listVisaTypesByDestinationController,
} from "../controllers/visa-type.controller";
import { validateRequest } from "../middleware";
import {
  createVisaTypeSchema,
  listSubVisaTypesByVisaTypeSchema,
  listVisaTypesByDestinationSchema,
} from "../schema/visa-type.schema";

const router = Router();

router.post(
  "/create",
  validateRequest(createVisaTypeSchema),
  createVisaTypeController,
);
router.get(
  "/list",
  validateRequest(listVisaTypesByDestinationSchema),
  listVisaTypesByDestinationController,
);
router.get(
  "/sub-visa/list",
  validateRequest(listSubVisaTypesByVisaTypeSchema),
  listSubVisaTypesByVisaTypeController,
);
router.get("/hierarchy", listAllVisaHierarchyController);

export default router;
