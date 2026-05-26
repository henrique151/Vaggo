import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';
import { Roles } from '../types/Roles';
import {
    getDashboardStats,
    getAllUsers,
    getBlockedUsersCount,
    toggleUserBlock,
    updateUserAdmin,
    deleteUserAdmin,
    getAllVehiclesAdmin,
    searchVehiclesAdmin,
    getVehicleByIdAdmin,
    updateVehicleAdmin,
    deleteVehicleAdmin,
    getAllPropertiesAdmin,
    searchPropertiesAdmin,
    getPropertyByIdAdmin,
    updatePropertyAdmin,
    deletePropertyAdmin,
    getAllSpotsAdmin,
    searchSpotsAdmin,
    evaluateSpotAdmin,
    toggleSpotActiveAdmin,
    deleteSpotAdmin,
    getAllReservationsAdmin,
    searchReservationsAdmin,
    forceCancelReservation,
    getReservationByIdAdmin,
    getAllReportsAdmin,
    searchReportsAdmin,
    getReportByIdAdmin,
    updateReportStatusAdmin,
    getAllReviewsAdmin,
    searchReviewsAdmin,
    deleteReviewAdmin,
    getReviewByIdAdmin
} from '../controllers/adminController';

const router = Router();

router.use(authMiddleware, permissionMiddleware(Roles.ADMIN));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Usuários
router.get('/users', getAllUsers);
router.get('/users/blocked/count', getBlockedUsersCount);
router.patch('/users/:id/block', toggleUserBlock);
router.put('/users/:id', updateUserAdmin);
router.delete('/users/:id', deleteUserAdmin);

// Veículos
router.get('/vehicles/search', searchVehiclesAdmin);
router.get('/vehicles', getAllVehiclesAdmin);
router.get('/vehicles/:id', getVehicleByIdAdmin);
router.put('/vehicles/:id', updateVehicleAdmin);
router.delete('/vehicles/:id', deleteVehicleAdmin);

// Propriedades
router.get('/properties/search', searchPropertiesAdmin);
router.get('/properties', getAllPropertiesAdmin);
router.get('/properties/:id', getPropertyByIdAdmin);
router.put('/properties/:id', updatePropertyAdmin);
router.delete('/properties/:id', deletePropertyAdmin);

// Vagas (Spots)
router.get('/spots/search', searchSpotsAdmin);
router.get('/spots', getAllSpotsAdmin);
router.patch('/spots/:id/evaluate', evaluateSpotAdmin);
router.patch('/spots/:id/active', toggleSpotActiveAdmin);
router.delete('/spots/:id', deleteSpotAdmin);

// Reservas (Reservations)
router.get('/reservations/search', searchReservationsAdmin);
router.get('/reservations', getAllReservationsAdmin);
router.get('/reservations/:id', getReservationByIdAdmin);
router.patch('/reservations/:id/force-cancel', forceCancelReservation);

// Denúncias (Reports)
router.get('/reports/search', searchReportsAdmin);
router.get('/reports', getAllReportsAdmin);
router.get('/reports/:id', getReportByIdAdmin);
router.patch('/reports/:id/status', updateReportStatusAdmin);

// Avaliações (Reviews)
router.get('/reviews/search', searchReviewsAdmin);
router.get('/reviews', getAllReviewsAdmin);
router.delete('/reviews/:id', deleteReviewAdmin);
router.get('/reviews/:id', getReviewByIdAdmin);

export default router;
