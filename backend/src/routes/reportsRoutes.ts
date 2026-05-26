import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';
import { Roles } from '../types/Roles';
import { validateBody } from '../middlewares/validateBody';
import { uploadReportImages } from '../middlewares/upload';
import {
    createReport,
    getMyReports,
    getReportById,
    listReports,
    requestReportReanalysis,
    updateReportStatus
} from '../controllers/reportsController';
import {
    requestReportReanalysisSchema,
    updateReportStatusSchema
} from '../schemas/reportsSchema';

const router = Router();

router.post('/', authMiddleware, uploadReportImages, createReport);
router.get('/my', authMiddleware, getMyReports);
router.patch('/:id/reanalysis', authMiddleware, validateBody(requestReportReanalysisSchema), requestReportReanalysis);

export default router;
