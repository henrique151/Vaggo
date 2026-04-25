import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const FILE_SIGNATURES: Record<string, Buffer[]> = {
    'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
    'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    'image/webp': [Buffer.from('RIFF'), Buffer.from('WEBP')],
};

export interface FileData {
    buffer: Buffer;
    mimetype: string;
}

export class ImageService {
    private static validateFile(file: FileData): void {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) throw new Error('INVALID_IMAGE_FORMAT');
        if (file.buffer.length > MAX_SIZE_BYTES) throw new Error('IMAGE_TOO_LARGE');

        const signatures = FILE_SIGNATURES[file.mimetype];
        const isValidSignature = signatures?.some(sig => file.buffer.subarray(0, sig.length).equals(sig));
        if (!isValidSignature) throw new Error('INVALID_IMAGE_SIGNATURE');
    }

    private static async sanitizeImage(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer).rotate().toBuffer(); // Remove metadados EXIF
    }

    private static uploadStream(buffer: Buffer, options: any): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error || !result) return reject(error);
                resolve(result);
            });
            stream.end(buffer);
        });
    }

    static async uploadUserAvatar(file: FileData, userId: number): Promise<UploadApiResponse> {
        this.validateFile(file);
        const sanitized = await this.sanitizeImage(file.buffer);
        return this.uploadStream(sanitized, {
            folder: `vaggo/users/user_${userId}/avatarUrl`,
            public_id: `avatar_${userId}`,
            overwrite: true, // Garante que atualizações sobrescrevam o antigo no Cloudinary
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }, { quality: 'auto', fetch_format: 'auto' }]
        });
    }

    static async uploadPropertyImage(file: FileData, userId: number, propertyId: number, index: number): Promise<UploadApiResponse> {
        this.validateFile(file);
        const sanitized = await this.sanitizeImage(file.buffer);
        return this.uploadStream(sanitized, {
            folder: `vaggo/users/user_${userId}/properties`,
            public_id: `property_${propertyId}_img_${index}_${Date.now()}`, // Usando Date.now para evitar cache agressivo no update
            transformation: [{ width: 1280, height: 720, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
        });
    }

    static async uploadSpotImage(file: FileData, userId: number, spotId: number): Promise<UploadApiResponse> {
        this.validateFile(file);
        const sanitized = await this.sanitizeImage(file.buffer);
        return this.uploadStream(sanitized, {
            folder: `vaggo/users/user_${userId}/spots/spot_${spotId}`,
            public_id: `spot_${spotId}_img_${Date.now()}`,
            overwrite: true,
            transformation: [{ width: 800, height: 600, crop: 'fill' }, { quality: 'auto', fetch_format: 'auto' }]
        });
    }

    static async deleteImage(publicId: string): Promise<void> {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    }

    static async deleteFolder(folderPath: string): Promise<void> {
        try {
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            await cloudinary.api.delete_folder(folderPath);
        } catch (error) {
            console.error(`Falha ao deletar pasta do Cloudinary: ${folderPath}`, error);
        }
    }

    // Extrai o public_id a partir de uma URL segura do Cloudinary
    static extractPublicId(url: string): string | null {
        const match = url.match(/\/v\d+\/(.+?)\.\w+$/);
        return match ? match[1] : null;
    }
}