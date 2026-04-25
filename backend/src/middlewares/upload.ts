import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const propertyImageFieldNames = ['images', 'files'];

const multerSingle = multer({
    storage,
    limits: { fieldSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('INVALID_IMAGE_FORMAT'));
        }
        cb(null, true);
    },
}).single('avatarUrl');

const multerMultiple = multer({
    storage,
    limits: { fieldSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('INVALID_IMAGE_FORMAT'));
        }
        cb(null, true);
    },
}).fields([
    { name: 'images', maxCount: 10 },
    { name: 'files', maxCount: 10 }
]);

export const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
    multerSingle(req, res, (err) => {
        if (err) {
            return next(err);
        }
        next();
    });
};

export const uploadMultiple = (req: Request, res: Response, next: NextFunction) => {
    multerMultiple(req, res, (err) => {
        if (err) {
            if (err.message === 'Unexpected field' && !propertyImageFieldNames.includes(err.field)) {
                err.message = 'INVALID_UPLOAD_FIELD';
            }

            if (err.code === 'LIMIT_FILE_COUNT') {
                err.message = 'PROPERTY_IMAGE_LIMIT';
            }

            return next(err);
        }

        const groupedFiles = req.files as Record<string, Express.Multer.File[]> | undefined;
        const normalizedFiles = propertyImageFieldNames.flatMap((fieldName) => groupedFiles?.[fieldName] || []);

        req.files = normalizedFiles as Express.Multer.File[];
        next();
    });
};
