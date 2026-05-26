import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReviewService } from '../services/ReviewService';
import { CreateReviewInput, UpdateReviewInput, getReviewsFilterSchema } from '../schemas/reviewsSchema';

/**
 * Criar Avaliação
 * Qualquer usuário autenticado com reserva finalizada.
 */

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReviewService.createReview(userId, req.body as CreateReviewInput);

    res.status(201).json({
        success: true,
        message: 'Avaliacao registrada com sucesso',
        data
    });
});

/**
 * Minhas Avaliações
 * Retorna as avaliações feitas pelo usuário autenticado.
 */
export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReviewService.getMyReviews(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Avaliações por Propriedade
 * Retorna todas as avaliações de uma propriedade (público).
 */
export const getPropertyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const propertyId = Number(req.params.propertyId);
    const result = await ReviewService.getReviewsByProperty(propertyId);

    res.status(200).json({ success: true, ...result });
});

/**
 * Avaliações por Vaga
 * Retorna todas as avaliações de uma vaga (público).
 */
export const getSpotReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const spotId = Number(req.params.spotId);
    const result = await ReviewService.getReviewsBySpot(spotId);

    res.status(200).json({ success: true, ...result });
});

/**
 * Atualizar Avaliação
 * O dono da avaliação pode atualizar.
 */
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

/**
 * Deletar Avaliação
 * O dono da avaliação ou ADMIN/MANAGER pode deletar.
 */
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const role = req.user?.role;
    await ReviewService.deleteReview(id, userId, role);

    res.status(200).json({ success: true, message: 'Avaliacao removida com sucesso' });
});

/**
 * Listar Todas as Avaliações
 * Apenas MANAGER e ADMIN.
 */
export const getAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filterResult = getReviewsFilterSchema.safeParse(req.query);

    if (!filterResult.success) {
        return res.status(400).json({ success: false, message: 'Filtros de avaliacao invalidos' });
    }

    const data = await ReviewService.getAllReviews(filterResult.data);
    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Obter uma Avaliação por ID
 * Público.
 */
export const getReviewById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await ReviewService.getReviewById(id);
    res.status(200).json({ success: true, data });
});
