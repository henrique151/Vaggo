import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReviewService } from '../services/ReviewService';
import { CreateReviewInput, UpdateReviewInput } from '../schemas/reviewsSchema';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReviewService.createReview(userId, req.body as CreateReviewInput);

    res.status(201).json({
        success: true,
        message: 'Avaliacao registrada com sucesso',
        data
    });
});

export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReviewService.getMyReviews(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

export const getPropertyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const propertyId = Number(req.params.propertyId);
    const result = await ReviewService.getReviewsByProperty(propertyId);

    res.status(200).json({ success: true, ...result });
});

export const getSpotReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const spotId = Number(req.params.spotId);
    const result = await ReviewService.getReviewsBySpot(spotId);

    res.status(200).json({ success: true, ...result });
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const data = await ReviewService.updateReview(id, userId, req.body as UpdateReviewInput);

    res.status(200).json({
        success: true,
        message: 'Avaliacao atualizada com sucesso',
        data
    });
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    await ReviewService.deleteReview(id, userId);

    res.status(200).json({ success: true, message: 'Avaliacao removida com sucesso' });
});
