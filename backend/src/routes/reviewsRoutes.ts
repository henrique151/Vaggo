import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import {
    createReview,
    deleteReview,
    getMyReviews,
    getPropertyReviews,
    getSpotReviews,
    updateReview,
    getAllReviews,
} from '../controllers/reviewsController';
import { Roles } from '../types/Roles';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';
import { createReviewSchema, updateReviewSchema } from '../schemas/reviewsSchema';

const router = Router();

router.post('/', authMiddleware, validateBody(createReviewSchema), createReview);
router.get('/my', authMiddleware, getMyReviews);
router.get('/', authMiddleware, permissionMiddleware(Roles.MANAGER, Roles.ADMIN), getAllReviews);
router.get('/properties/:propertyId', getPropertyReviews);
router.get('/spots/:spotId', getSpotReviews);
router.put('/:id', authMiddleware, validateBody(updateReviewSchema), updateReview);
router.delete('/:id', authMiddleware, deleteReview);

export default router;