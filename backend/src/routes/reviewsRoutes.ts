import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateBody';
import {
    createReview,
    deleteReview,
    getMyReviews,
    getPropertyReviews,
    getSpotReviews,
    updateReview
} from '../controllers/reviewsController';
import { createReviewSchema, updateReviewSchema } from '../schemas/reviewsSchema';

const router = Router();

router.post('/', authMiddleware, validateBody(createReviewSchema), createReview);
router.get('/my', authMiddleware, getMyReviews);
router.get('/properties/:propertyId', getPropertyReviews);
router.get('/spots/:spotId', getSpotReviews);
router.put('/:id', authMiddleware, validateBody(updateReviewSchema), updateReview);
router.delete('/:id', authMiddleware, deleteReview);

export default router;
