import { Router } from "express";
import { listByProperty, evaluateSpots, updateSpot, deleteSpot, updateSpotData, generateSpots } from '../controllers/spotsController';
import { validateBody } from "../middlewares/validateBody";
import { evaluateSpotSchema, generateSpotsSchema, updateSpotSchema, updateSpotStatusSchema } from '../schemas/spotsSchema';
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadMultiple, uploadSpotSingle } from "../middlewares/upload";
import { uploadLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
    '/properties/:propId/spots',
    authMiddleware,
    uploadLimiter,
    uploadMultiple,
    validateBody(generateSpotsSchema),
    generateSpots
);

router.get(
    '/properties/:propId/spots',
    authMiddleware,
    listByProperty
);

router.patch(
    '/:id/evaluate',
    authMiddleware,
    validateBody(evaluateSpotSchema),
    evaluateSpots
);

router.patch(
    '/:id/status',
    authMiddleware,
    validateBody(updateSpotStatusSchema),
    updateSpot
);

router.put(
    '/properties/:propId/spots/:id',
    authMiddleware,
    uploadLimiter,
    uploadSpotSingle,
    validateBody(updateSpotSchema),
    updateSpotData
);

router.delete(
    '/properties/:propId/spots/:id',
    authMiddleware,
    deleteSpot
);



export default router;
