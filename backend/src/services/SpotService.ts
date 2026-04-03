import sequelize from "../database";
import Spot from "../models/Spot";
import Property from "../models/Property";

export class SpotService {
    static async generateSpots(propId: number, spotData: any) {
        const transaction = await sequelize.transaction();
        try {
            const property = await Property.findByPk(propId, { transaction })
            if (!property) throw new Error('PROPERTY_NOT_FOUND');

            const spots = [];
            for (let i = 1; i <= spotData.count; i++) {
                spots.push({
                    size: spotData.size,
                    status: 'DISPONIVEL',
                    identifier: `${spotData.prefix}${i}`,
                    isCovered: spotData.isCovered,
                    isActive: true,
                    propertyId: propId
                });
            }

            const createdSpots = await Spot.bulkCreate(spots, { transaction });
            await transaction.commit();
            return createdSpots;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getByProperty(propId: number) {
        return Spot.findAll({ where: { propertyId: propId, isActive: true } });
    }

    static async updateStatusProperty(spotId: number, status: any) {
        const spot = await Spot.findByPk(spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        await spot.update({ status });
        return spot;
    }
}
