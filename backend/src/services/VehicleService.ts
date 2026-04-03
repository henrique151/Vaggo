import sequelize from "../database";
import User from "../models/User";
import Vehicle from "../models/Vehicle";
import { CreateVehicleInput, UpdateVehicleInput } from "../schemas/vehiclesSchema";

export class VehicleService {
    static async createVehicle(vehicleData: CreateVehicleInput, authUserId: number) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(authUserId, { transaction });

            if (!user) throw new Error('USER_NOT_FOUND');

            const vehicleCount = await Vehicle.count({
                where: { userId: user.id },
                transaction
            })

            if (vehicleCount >= 3) {
                throw new Error('MAX_VEHICLES_REACHED');
            }

            const existingVehicle = await Vehicle.findOne({
                where: { licensePlate: vehicleData.licensePlate },
                transaction
            });

            if (existingVehicle) throw new Error('LICENSE_PLATE_ALREADY_EXISTS');

            const vehicle = await Vehicle.create(
                {
                    ...vehicleData,
                    userId: user.id
                },
                { transaction }
            );

            await transaction.commit();
            return vehicle;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getAllVehicles() {
        return Vehicle.findAll({
            attributes: { exclude: ['USU_INT_ID'] },
            where: { isActive: true },
            include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
        });
    }

    static async getUserVehicles(authUserId: number) {
        return Vehicle.findAll({
            where: { userId: authUserId },
            attributes: { exclude: ['USU_INT_ID'] }
        });
    }

    static async getVehicleById(vehicleId: number, authUserId: number) {
        const vehicle = await Vehicle.findByPk(vehicleId, {
            attributes: { exclude: ['USU_INT_ID'] }
        });

        if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
        if (vehicle.userId !== authUserId) throw new Error('FORBIDDEN');

        return vehicle;
    }

    static async updateVehicle(id: number, updateData: UpdateVehicleInput, authUserId: number) {
        const transaction = await sequelize.transaction();
        try {
            const vehicle = await Vehicle.findByPk(id, { transaction });
            if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');

            if (vehicle.userId !== authUserId) throw new Error('FORBIDDEN');

            if (updateData.licensePlate && updateData.licensePlate !== vehicle.licensePlate) {
                const existingPlate = await Vehicle.findOne({
                    where: { licensePlate: updateData.licensePlate },
                    transaction
                });
                if (existingPlate) throw new Error('LICENSE_PLATE_ALREADY_EXISTS');
            }

            await vehicle.update(updateData, { transaction });
            await transaction.commit();

            return this.getVehicleById(id, authUserId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteVehicle(id: number, authUserId: number) {
        const transaction = await sequelize.transaction();
        try {
            const vehicle = await Vehicle.findByPk(id, { transaction });
            if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
            if (vehicle.userId !== authUserId) throw new Error('FORBIDDEN');

            await vehicle.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}