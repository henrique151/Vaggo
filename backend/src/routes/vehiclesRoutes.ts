import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehiclesSchema';
import {
    createVehicle, getAllVehicles, getVehicleById,
    updateVehicle, deleteVehicle, getMyVehicles
} from '../controllers/vehiclesController';

const router = Router();


router.post('/', authMiddleware, validateBody(createVehicleSchema), createVehicle);

router.get('/', authMiddleware, getAllVehicles);
router.get('/my-vehicles', authMiddleware, getMyVehicles);
router.get('/:userId/:id', authMiddleware, getVehicleById);

router.put('/:id', authMiddleware, validateBody(updateVehicleSchema), updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;