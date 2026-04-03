import { Router } from "express";
import { generateSports, listByProperty, patchStatus } from '../controllers/spotController';
import { validateBody } from "../middlewares/validateBody";
import { generateSpotsSchema, updateSpotStatusSchema } from '../schemas/sportsSchema';
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
    '/properties/:propId/spots',
    authMiddleware,
    validateBody(generateSpotsSchema),
    generateSports
);

router.get(
    '/properties/:propId/spots',
    authMiddleware,
    listByProperty
);

router.patch(
    '/:id/status',
    authMiddleware,
    validateBody(updateSpotStatusSchema),
    patchStatus
);

export default router;