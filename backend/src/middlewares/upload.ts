import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const propertyImageFieldNames = ['images', 'files'];
const spotImageFieldNames = ['imageUrl', 'image', 'file', 'images', 'files'];

const createUploader = () => multer({
    storage,
    limits: { fieldSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('INVALID_IMAGE_FORMAT'));
        }
        cb(null, true);
    },
});

const multerSingle = createUploader().single('avatarUrl');

const multerMultiple = createUploader().fields([
    { name: 'images', maxCount: 3 },
    { name: 'files', maxCount: 3 }
]);

const multerSpotSingle = createUploader().fields(
    spotImageFieldNames.map((fieldName) => ({ name: fieldName, maxCount: 1 }))
);

const normalizeUploadError = (err: any, allowedFieldNames: string[]) => {
    if (err.message === 'Unexpected field' && !allowedFieldNames.includes(err.field)) {
        err.message = 'INVALID_UPLOAD_FIELD';
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        err.message = 'PROPERTY_IMAGE_LIMIT';
    }

    return err;
};

export const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
    multerSingle(req, res, (err) => {
        if (err) {
            return next(normalizeUploadError(err, ['avatarUrl']));
        }
        next();
    });
};

export const uploadMultiple = (req: Request, res: Response, next: NextFunction) => {
    multerMultiple(req, res, (err) => {
        if (err) {
            return next(normalizeUploadError(err, propertyImageFieldNames));
        }

        const groupedFiles = req.files as Record<string, Express.Multer.File[]> | undefined;
        const normalizedFiles = propertyImageFieldNames.flatMap((fieldName) => groupedFiles?.[fieldName] || []);

        req.files = normalizedFiles as Express.Multer.File[];
        next();
    });
};

export const uploadSpotSingle = (req: Request, res: Response, next: NextFunction) => {
    multerSpotSingle(req, res, (err) => {
        if (err) {
            return next(normalizeUploadError(err, spotImageFieldNames));
        }

        const groupedFiles = req.files as Record<string, Express.Multer.File[]> | undefined;
        const normalizedFiles = spotImageFieldNames.flatMap((fieldName) => groupedFiles?.[fieldName] || []);

        if (normalizedFiles.length > 1) {
            return next(new Error('SPOT_IMAGE_LIMIT'));
        }

        req.file = normalizedFiles[0];
        next();
    });
};
