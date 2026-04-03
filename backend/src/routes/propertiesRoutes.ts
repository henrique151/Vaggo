import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import { createProperty, deleteProperty, getAllProperties, getPropertyById, updateProperty } from '../controllers/propertiesController';
import { createPropertySchema } from '../schemas/propertiesSchema';

const router = Router();

router.post('/', validateBody(createPropertySchema), createProperty);
router.get('/', authMiddleware, getAllProperties);
router.get('/:id', authMiddleware, getPropertyById);
router.put('/:id', validateBody(createPropertySchema), updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

export default router;