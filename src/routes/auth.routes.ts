import { Router } from "express";
import { loginController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware";
import { loginSchema } from "../schema/auth.schema";

const router = Router();

router.post("/login", validateRequest(loginSchema), loginController);

export default router;
