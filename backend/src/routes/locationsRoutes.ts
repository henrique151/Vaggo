import { Router } from "express";
import { getStates, getCitiesState } from "../controllers/locationsController";

const router = Router();

router.get('/states', getStates);
router.get('/states/:stateId/cities', getCitiesState);

export default router;
