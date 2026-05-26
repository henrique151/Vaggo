import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createReservation, updateReservationStatus, getMyReservations, getOwnerReservationRequests, getAllReservations, deleteReservation } from '../controllers/reservationController';
import { searchByAddress } from '../controllers/spotSearchController';
import { Roles } from '../types/Roles';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';

const router = Router();

router.get(
    '/search/address',
    searchByAddress
);

router.get('/',
    authMiddleware,
    getMyReservations
);

router.get('/all',
    authMiddleware,
    permissionMiddleware(Roles.MANAGER, Roles.ADMIN),
    getAllReservations
);

router.get('/owner',
    authMiddleware,
    getOwnerReservationRequests
);

router.post('/',
    authMiddleware,
    createReservation
);

router.patch('/:id/:action',
    authMiddleware,
    updateReservationStatus
);

router.delete('/:id',
    authMiddleware,
    permissionMiddleware(Roles.MANAGER, Roles.ADMIN),
    deleteReservation
);

export default router;

