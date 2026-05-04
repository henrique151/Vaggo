import type { Transaction } from 'sequelize';
import sequelize from '../database';
import Spot from '../models/Spot';
import Property from '../models/Property';
import PropertyUser from '../models/PropertyUser';
import SpotAvailability from '../models/SpotAvailabilities';
import {
    DEFAULT_SPOT_AVAILABILITY,
    GenerateSpotsInput,
    SpotAvailabilityInput,
    SpotAvailabilityPatchInput,
    spotAvailabilitySchema,
    UpdateSpotInput
} from '../schemas/spotsSchema';
import { FileData, ImageService } from './ImageService';

export class SpotService {
    static async generateSpots(propId: number, spotData: GenerateSpotsInput, files?: FileData[]) {
        const transaction = await sequelize.transaction();
        const uploadedPublicIds: string[] = [];
        const createdSpotIds: number[] = [];

        try {
            const property = await Property.findByPk(propId, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const ownerUserId = await this.getOwnerUserId(propId, transaction);

            if (!files || files.length < spotData.count) {
                throw new Error('SPOT_IMAGE_REQUIRED');
            }

            const currentCount = await Spot.count({
                where: { propertyId: propId, isActive: true },
                transaction
            });
            
            if (currentCount + spotData.count > property.totalCapacity) {
                throw new Error('PROPERTY_CAPACITY_EXCEEDED');
            }

            for (let i = 0; i < spotData.count; i++) {
                const spot = await Spot.create({
                    price: spotData.price,
                    size: spotData.size,
                    status: 'INDISPONIVEL',
                    approvalStatus: 'PENDENTE',
                    identifier: `${spotData.prefix}${i + 1}`,
                    allowedVehicles: spotData.allowedVehicles || ['CARRO'],
                    isCovered: spotData.isCovered,
                    isActive: true,
                    propertyId: propId
                }, { transaction });

                createdSpotIds.push(spot.id);

                await SpotAvailability.create({
                    spotId: spot.id,
                    ...spotData.availability
                }, { transaction });

                const upload = await ImageService.uploadSpotImage(files[i], ownerUserId, spot.id);
                uploadedPublicIds.push(upload.public_id);

                await spot.update({ imageUrl: upload.secure_url }, { transaction });
            }

            await transaction.commit();

            return Spot.findAll({
                where: { id: createdSpotIds },
                include: [{ model: SpotAvailability, as: 'availability' }],
                order: [['id', 'ASC']],
            });
        } catch (error) {
            await transaction.rollback();
            for (const pid of uploadedPublicIds) {
                await ImageService.deleteImage(pid).catch(console.error);
            }
            throw error;
        }
    }

    static async evaluateSpot(spotId: number, status: 'APROVADA' | 'RECUSADA') {
        const spot = await Spot.findByPk(spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        const operationalStatus = status === 'APROVADA' ? 'DISPONIVEL' : 'INDISPONIVEL';

        await spot.update({
            approvalStatus: status,
            status: operationalStatus
        });

        return this.getSpotWithAvailability(spot.id);
    }

    static async getByProperty(propId: number) {
        return Spot.findAll({
            where: { propertyId: propId, isActive: true },
            attributes: { exclude: ['PRO_INT_ID'] },
            include: [{ model: SpotAvailability, as: 'availability', required: false }],
            order: [['id', 'ASC']],
        });
    }

    static async updateSpotData(spotId: number, updateData: UpdateSpotInput, file?: FileData) {
        const transaction = await sequelize.transaction();
        let newPublicId: string | null = null;

        try {
            const spot = await Spot.findByPk(spotId, { transaction });
            if (!spot) throw new Error('SPOT_NOT_FOUND');

            const { availability, ...spotUpdateData } = updateData;

            if (file) {
                const ownerUserId = await this.getOwnerUserId(spot.propertyId, transaction);

                const upload = await ImageService.uploadSpotImage(file, ownerUserId, spot.id);
                newPublicId = upload.public_id;

                if (spot.imageUrl) {
                    const oldPublicId = ImageService.extractPublicId(spot.imageUrl);
                    if (oldPublicId) await ImageService.deleteImage(oldPublicId).catch(console.error);
                }

                await spot.update({ ...spotUpdateData, imageUrl: upload.secure_url }, { transaction });
            } else if (Object.keys(spotUpdateData).length > 0) {
                await spot.update(spotUpdateData, { transaction });
            }

            if (availability) {
                await this.upsertAvailability(spot.id, availability, transaction);
            }

            await transaction.commit();
            return this.getSpotWithAvailability(spot.id);
        } catch (error) {
            await transaction.rollback();
            if (newPublicId) await ImageService.deleteImage(newPublicId).catch(console.error);
            throw error;
        }
    }

    static async deleteSpot(spotId: number, propId: number) {
        const transaction = await sequelize.transaction();

        try {
            const spot = await Spot.findOne({
                where: { id: spotId, propertyId: propId },
                transaction
            });
            if (!spot) throw new Error('SPOT_NOT_FOUND');

            const folderPath = spot.imageUrl
                ? ImageService.extractFolderPath(spot.imageUrl)
                : null;

            await spot.destroy({ transaction });
            await transaction.commit();

            if (folderPath) {
                await ImageService.deleteFolder(folderPath).catch(console.error);
            }

            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateSpot(spotId: number, updateData: { status: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA' }) {
        const spot = await Spot.findOne({
            where: { id: spotId },
            attributes: { exclude: ['PRO_INT_ID'] },
        });
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        if (spot.approvalStatus !== 'APROVADA') {
            throw new Error('SPOT_NOT_APPROVED');
        }

        await spot.update(updateData);
        return this.getSpotWithAvailability(spot.id);
    }

    private static async getOwnerUserId(propertyId: number, transaction: Transaction) {
        const propertyUser = await PropertyUser.findOne({
            where: { propertyId, role: 'DONO' },
            transaction
        });

        const userId = propertyUser?.userId;
        if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

        return userId;
    }

    private static async upsertAvailability(
        spotId: number,
        availabilityPatch: SpotAvailabilityPatchInput,
        transaction: Transaction
    ) {
        const currentAvailability = await SpotAvailability.findOne({
            where: { spotId },
            transaction
        });

        const mergedAvailability = spotAvailabilitySchema.parse({
            startDate: currentAvailability?.startDate ?? DEFAULT_SPOT_AVAILABILITY.startDate,
            endDate: currentAvailability?.endDate ?? DEFAULT_SPOT_AVAILABILITY.endDate,
            weekdays: currentAvailability?.weekdays ?? DEFAULT_SPOT_AVAILABILITY.weekdays,
            startTime: currentAvailability?.startTime ?? DEFAULT_SPOT_AVAILABILITY.startTime,
            endTime: currentAvailability?.endTime ?? DEFAULT_SPOT_AVAILABILITY.endTime,
            ...availabilityPatch
        }) as SpotAvailabilityInput;

        if (currentAvailability) {
            await currentAvailability.update(mergedAvailability, { transaction });
            return currentAvailability;
        }

        return SpotAvailability.create({
            spotId,
            ...mergedAvailability
        }, { transaction });
    }

    private static async getSpotWithAvailability(spotId: number) {
        return Spot.findByPk(spotId, {
            include: [{ model: SpotAvailability, as: 'availability', required: false }]
        });
    }
}
