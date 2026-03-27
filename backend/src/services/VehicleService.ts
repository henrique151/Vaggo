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
            where: { isActive: true },
            include: [{ model: User, as: 'user', attributes: ['id', 'email'] }]
        });
    }

    static async getVehicleById(id: number) {
        const vehicle = await Vehicle.findByPk(id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
        })
        if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
        return vehicle;
    }

    static async updateVehicle(id: number, updateData: UpdateVehicleInput, authUserId: number) {
        const transaction = await sequelize.transaction();
        try {
            const vehicle = await Vehicle.findByPk(id);
            if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
            if (vehicle.userId !== authUserId) throw new Error('FORBIDDEN');


            if (updateData.licensePlate && updateData.licensePlate !== vehicle.licensePlate) {
                const existingPlate = await Vehicle.findOne({
                    where: { licensePlate: updateData.licensePlate }
                });
                if (existingPlate) throw new Error('LICENSE_PLATE_ALREADY_EXISTS');
            }

            await vehicle.update(updateData, { transaction });
            await transaction.commit();
            return this.getVehicleById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    static async deleteVehicle(id: number, authUserId: number) {
        const transaction = await sequelize.transaction();
        try {
            const vehicle = await Vehicle.findByPk(id);
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