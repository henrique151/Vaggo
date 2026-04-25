import sequelize from "../database";
import Spot from "../models/Spot";
import Property from "../models/Property";
import PropertyUser from "../models/PropertyUser";
import { GenerateSpotsInput, UpadateSpotInput } from "../schemas/spotsSchema";
import { FileData, ImageService } from "./ImageService";

export class SpotService {
    static async generateSpots(propId: number, spotData: GenerateSpotsInput, files?: FileData[]) {
        const transaction = await sequelize.transaction();
        const uploadedPublicIds: string[] = [];

        try {
            const property = await Property.findByPk(propId, { transaction });
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            // Buscar userId via PropertyUser
            const propertyUser = await PropertyUser.findOne({
                where: { propertyId: propId },
                transaction
            });
            const userId = propertyUser?.userId;
            if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

            if (!files || files.length < spotData.count) {
                throw new Error('SPOT_IMAGE_REQUIRED');
            }

            const spotsToCreate = [];

            for (let i = 0; i < spotData.count; i++) {
                const spot = await Spot.create({
                    price: spotData.price,
                    size: spotData.size,
                    status: 'INDISPONIVEL',
                    approvalStatus: 'PENDENTE',
                    identifier: `${spotData.prefix}${i + 1}`,
                    allowedVehicles: spotData.allowedVehicles || ['CARRO'],
                    operatingHours: spotData.operatingHours || {},
                    isCovered: spotData.isCovered,
                    isActive: true,
                    propertyId: propId
                }, { transaction });


                const upload = await ImageService.uploadSpotImage(files[i], userId, spot.id);
                uploadedPublicIds.push(upload.public_id);

                await spot.update({ imageUrl: upload.secure_url }, { transaction });
                spotsToCreate.push(spot);
            }

            await transaction.commit();
            return spotsToCreate;
        } catch (error) {
            await transaction.rollback();
            for (const pid of uploadedPublicIds) {
                await ImageService.deleteImage(pid).catch(console.error);
            }
            throw error;
        }
    }

    static async evaluateSpot(spotId: number, status: 'APROVADA' | 'RECUSADA' | 'SUSPENSA') {
        const spot = await Spot.findByPk(spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        const operationalStatus = status === 'APROVADA' ? 'DISPONIVEL' : 'INDISPONIVEL';

        await spot.update({
            approvalStatus: status as any,
            status: operationalStatus
        });
        return spot;
    }

    static async getByProperty(propId: number) {
        return Spot.findAll({
            where: { propertyId: propId, isActive: true },
            attributes: { exclude: ['PRO_INT_ID'] },
            order: [['id', 'ASC']],
        });
    }

    static async updateSpotData(spotId: number, updateData: UpadateSpotInput, file?: FileData) {
        const transaction = await sequelize.transaction();
        let newPublicId: string | null = null;
        try {
            const spot = await Spot.findByPk(spotId, { transaction });
            if (!spot) throw new Error('SPOT_NOT_FOUND');

            if (file) {
                // Buscar userId via Property e PropertyUser
                const property = await Property.findByPk(spot.propertyId, { transaction });
                if (!property) throw new Error('PROPERTY_NOT_FOUND');

                const propertyUser = await PropertyUser.findOne({
                    where: { propertyId: property.id },
                    transaction
                });
                const userId = propertyUser?.userId;
                if (!userId) throw new Error('PROPERTY_OWNER_NOT_FOUND');

                const upload = await ImageService.uploadSpotImage(file, userId, spot.id);
                newPublicId = upload.public_id;

                if (spot.imageUrl) {
                    const oldPublicId = ImageService.extractPublicId(spot.imageUrl);
                    if (oldPublicId) await ImageService.deleteImage(oldPublicId).catch(console.error);
                }

                await spot.update({ ...updateData, imageUrl: upload.secure_url }, { transaction });
            } else {
                await spot.update(updateData, { transaction });
            }

            await transaction.commit();
            return spot;
        } catch (error) {
            await transaction.rollback();
            if (newPublicId) await ImageService.deleteImage(newPublicId).catch(console.error);
            throw error;
        }

    }

    static async deleteSpot(spotId: number, propId: number) {
        const spot = await Spot.findOne({ where: { id: spotId, propertyId: propId } });
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        const publicId = spot.imageUrl ? ImageService.extractPublicId(spot.imageUrl) : null;

        await spot.destroy();

        if (publicId) {
            await ImageService.deleteImage(publicId).catch(console.error);
        }
        return true;

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
        return spot;
    }
}
