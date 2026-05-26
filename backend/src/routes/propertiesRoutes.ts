import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import { createProperty, deleteProperty, getAllProperties, getMyProperties, getPropertyById, updateProperty, searchProperties } from '../controllers/propertiesController';
import { createPropertySchema, updatePropertySchema } from '../schemas/propertiesSchema';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { uploadMultiple } from '../middlewares/upload';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';
import { Roles } from '../types/Roles';

const router = Router();

router.post('/', authMiddleware, uploadLimiter, uploadMultiple, validateBody(createPropertySchema), createProperty);
router.get('/', getAllProperties);
router.get('/my-properties', authMiddleware, getMyProperties);
router.get('/:id', authMiddleware, getPropertyById);
router.put('/:id/', authMiddleware, uploadLimiter, uploadMultiple, validateBody(updatePropertySchema), updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);

export default router;
