import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/UserService';
import { DashboardService } from '../services/DashboardService';
import { ReservationService } from '../services/ReservationService';
import { SpotService } from '../services/SpotService';
import { VehicleService } from '../services/VehicleService';
import { PropertyService } from '../services/PropertyService';
import { ReportService } from '../services/ReportService';
import { ReviewService } from '../services/ReviewService';
import { Roles } from '../types/Roles';

/**
 * DASHBOARD
 */
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await DashboardService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
});

/**
 * USUÁRIOS
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json({ success: true, total: users.length, data: users });
});

export const getBlockedUsersCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const count = await UserService.getBlockedUsersCount();
    res.status(200).json({ success: true, data: { blocked: count } });
});

export const toggleUserBlock = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const blocked = req.body?.blocked;

    if (blocked === undefined || blocked === null) {
        return res.status(400).json({ success: false, message: 'Campo "blocked" é obrigatório (true/false)' });
    }

    const user = await UserService.toggleBlockUser(id, Boolean(blocked));
    const action = Boolean(blocked) ? 'bloqueado' : 'desbloqueado';
    res.status(200).json({ success: true, message: `Usuário ${action} com sucesso`, data: user });
});

export const updateUserAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const fileData = req.file ? { buffer: req.file.buffer, mimetype: req.file.mimetype } : undefined;
    const data = await UserService.updateAccount(id, req.body, fileData);
    res.status(200).json({ success: true, message: 'Usuário atualizado com sucesso', data });
});

export const deleteUserAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    await UserService.deleteAccount(id);
    res.status(200).json({ success: true, message: 'Usuário removido' });
});

/**
 * VEÍCULOS (VEHICLES)
 */
export const getAllVehiclesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await VehicleService.getAllVehicles();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchVehiclesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, licensePlate, email } = req.query;
    const data = await VehicleService.searchVehicles({
        id: id ? Number(id) : undefined,
        licensePlate: licensePlate as string,
        email: email as string
    });
    res.status(200).json({ success: true, total: data.length, data });
});

export const getVehicleByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    const data = await VehicleService.getVehicleById(id, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, data });
});

export const updateVehicleAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    const data = await VehicleService.updateVehicle(id, req.body, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Veículo atualizado', data });
});

export const deleteVehicleAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    await VehicleService.deleteVehicle(id, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Veículo removido com sucesso' });
});

/**
 * PROPRIEDADES (PROPERTIES)
 */
export const getAllPropertiesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await PropertyService.getAllProperties();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchPropertiesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, name, email, ownerName } = req.query;
    const data = await PropertyService.searchAdminProperties({
        id: id ? Number(id) : undefined,
        name: name as string,
        email: email as string,
        ownerName: ownerName as string
    });
    res.status(200).json({ success: true, total: data.length, data });
});

export const getPropertyByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await PropertyService.getAdminPropertyById(id);
    res.status(200).json({ success: true, data });
});

export const updatePropertyAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    const newFiles = (req.files as any) || [];
    const imagesToRemove = req.body?.imagesToRemove || [];

    const data = await PropertyService.updateProperty(id, req.body || {}, newFiles, imagesToRemove, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Propriedade atualizada', data });
});

export const deletePropertyAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    await PropertyService.deleteProperty(id, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Propriedade removida com sucesso' });
});

/**
 * VAGAS (SPOTS)
 */
export const getAllSpotsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await SpotService.getAdminSpots();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchSpotsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, email, status } = req.query;
    const data = await SpotService.searchAdminSpots({
        id: id ? Number(id) : undefined,
        email: email as string,
        status: status as string
    });
    res.status(200).json({ success: true, total: data.length, data });
});

export const evaluateSpotAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { status, rejectionReason } = req.body;
    const data = await SpotService.evaluateSpot(id, status, rejectionReason);
    res.status(200).json({ success: true, message: 'Status da vaga atualizado', data });
});

export const toggleSpotActiveAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { isActive } = req.body;
    const data = await SpotService.toggleActive(id, Boolean(isActive));
    res.status(200).json({ success: true, message: 'Visibilidade da vaga alterada', data });
});

export const deleteSpotAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const { propertyId } = req.body;
    const adminId = Number(req.user?.id);
    await SpotService.deleteSpot(id, Number(propertyId), adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Vaga removida com sucesso' });
});



export const getAllReservationsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await ReservationService.getAllReservations();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchReservationsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, email, startDate, endDate, status, city } = req.query;

    const data = await ReservationService.searchAdminReservations({
        id: id ? Number(id) : undefined,
        email: email as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        city: city as string
    });

    res.status(200).json({ success: true, total: data.length, data });
});

export const forceCancelReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    await ReservationService.forceCancelReservation(id);
    res.status(200).json({ success: true, message: 'Reserva cancelada abruptamente.' });
});

export const getReservationByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    const data = await ReservationService.getById(id);
    res.status(200).json({ success: true, data });
});


export const getAllReportsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await ReportService.getAllReportsAdmin();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchReportsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, email, status, targetType } = req.query;
    const data = await ReportService.searchReportsAdmin({
        id: id ? Number(id) : undefined,
        email: email as string,
        status: status as string,
        targetType: targetType as string
    });
    res.status(200).json({ success: true, total: data.length, data });
});

export const getReportByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    const data = await ReportService.getById(id, adminId, true);
    res.status(200).json({ success: true, data });
});

export const updateReportStatusAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await ReportService.updateStatus(id, req.body as any);
    res.status(200).json({ success: true, message: 'Status da denúncia atualizado', data });
});

/**
 * AVALIAÇÕES (REVIEWS)
 */
export const getAllReviewsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await ReviewService.getAllReviewsAdmin();
    res.status(200).json({ success: true, total: data.length, data });
});

export const searchReviewsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, email, propertyId, spotId, reviewerId, minRating, maxRating } = req.query;
    const data = await ReviewService.searchReviewsAdmin({
        id: id ? Number(id) : undefined,
        email: email as string,
        propertyId: propertyId ? Number(propertyId) : undefined,
        spotId: spotId ? Number(spotId) : undefined,
        reviewerId: reviewerId ? Number(reviewerId) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        maxRating: maxRating ? Number(maxRating) : undefined
    });
    res.status(200).json({ success: true, total: data.length, data });
});

export const deleteReviewAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const adminId = Number(req.user?.id);
    await ReviewService.deleteReview(id, adminId, Roles.ADMIN);
    res.status(200).json({ success: true, message: 'Avaliação removida com sucesso' });
});

export const getReviewByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await ReviewService.getReviewById(id);
    res.status(200).json({ success: true, data });
});
