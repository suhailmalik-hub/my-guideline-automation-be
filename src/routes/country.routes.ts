import { Router } from "express";
import { listDestinationCountriesController, listWorldCountriesController } from "../controllers/country.controller";

const router = Router();

router.get("/world/list", listWorldCountriesController);
router.get("/destination/list", listDestinationCountriesController);

export default router;
