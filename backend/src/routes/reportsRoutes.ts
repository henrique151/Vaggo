import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validateBody } from '../middlewares/validateBody';
import {
    createReport,
    getMyReports,
    getReportById,
    listReports,
    requestReportReanalysis,
    updateReportStatus
} from '../controllers/reportsController';
import {
    createReportSchema,
    requestReportReanalysisSchema,
    updateReportStatusSchema
} from '../schemas/reportsSchema';

const router = Router();

router.post('/', authMiddleware, validateBody(createReportSchema), createReport);
router.get('/my', authMiddleware, getMyReports);
router.get('/', authMiddleware, adminMiddleware, listReports);
router.get('/:id', authMiddleware, getReportById);
router.patch('/:id/status', authMiddleware, adminMiddleware, validateBody(updateReportStatusSchema), updateReportStatus);
router.patch('/:id/reanalysis', authMiddleware, validateBody(requestReportReanalysisSchema), requestReportReanalysis);

export default router;
