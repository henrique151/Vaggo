import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createReservation, updateReservationStatus, getMyReservations, getOwnerReservationRequests } from '../controllers/reservationController';
import { searchByAddress } from '../controllers/spotSearchController';

const router = Router();

router.get(
    '/search/address',
    searchByAddress
);

router.get('/',
    authMiddleware,
    getMyReservations
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

export default router;

