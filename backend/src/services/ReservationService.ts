import crypto from 'crypto';
import type { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../database';
import Reservation from '../models/Reservation';
import Spot from '../models/Spot';
import SpotAvailability from '../models/SpotAvailabilities';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import Property from '../models/Property';
import PropertyUser from '../models/PropertyUser';
import { CreateReservationInput } from '../schemas/reservationsSchema';
import { getCurrentDateString, isRangeWithinAvailability } from '../utils/dateRange';

function generateReservationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export class ReservationService {
    static async createReservation(data: CreateReservationInput) {
        const transaction = await sequelize.transaction();

        try {
            const spot = await Spot.findByPk(data.spotId, {
                include: [{ model: SpotAvailability, as: 'availability' }],
                transaction
            });
            if (!spot) throw new Error('SPOT_NOT_FOUND');
            if (!spot.isActive) throw new Error('SPOT_UNAVAILABLE');
            if (spot.approvalStatus !== 'APROVADA') throw new Error('SPOT_NOT_APPROVED');
            if (spot.status === 'INDISPONIVEL') throw new Error('SPOT_UNAVAILABLE');
            if (!spot.availability) throw new Error('SPOT_AVAILABILITY_NOT_CONFIGURED');

            if (!isRangeWithinAvailability(spot.availability, {
                startDate: data.startDate,
                endDate: data.endDate
            })) {
                throw new Error('RESERVATION_OUTSIDE_AVAILABILITY');
            }

            const vehicle = await Vehicle.findByPk(data.vehicleId, { transaction });
            if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');
            if (vehicle.userId !== data.userId) throw new Error('VEHICLE_NOT_YOURS');

            const allowedVehicles = (spot.allowedVehicles || []) as string[];
            if (!allowedVehicles.includes(vehicle.type)) {
                throw new Error('VEHICLE_TYPE_NOT_ALLOWED');
            }

            const conflict = await Reservation.findOne({
                where: {
                    spotId: data.spotId,
                    status: { [Op.in]: ['PENDENTE', 'APROVADA'] },
                    startDate: { [Op.lte]: data.endDate },
                    endDate: { [Op.gte]: data.startDate }
                },
                transaction
            });
            if (conflict) throw new Error('SPOT_PERIOD_CONFLICT');

            const propertyOwner = await PropertyUser.findOne({
                where: {
                    propertyId: spot.propertyId,
                    role: 'DONO'
                },
                transaction
            });

            const reservation = await Reservation.create({
                ...data,
                code: generateReservationCode(),
                status: 'PENDENTE',
            }, { transaction });

            await this.syncSpotStatus(spot.id, transaction);

            await transaction.commit();

            if (propertyOwner) {
                this.notifyOwner(propertyOwner.userId, 'NEW_RESERVATION', reservation.id);
            }

            return this.getById(reservation.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async updateStatus(
        id: number,
        action: 'approve' | 'reject' | 'cancel',
        userId: number
    ) {
        const transaction = await sequelize.transaction();

        try {
            const reservation = await Reservation.findByPk(id, {
                include: [{ model: Spot, as: 'spot' }],
                transaction
            });
            if (!reservation) throw new Error('RESERVATION_NOT_FOUND');

            if (action === 'cancel' && reservation.userId !== userId) {
                throw new Error('FORBIDDEN');
            }

            if (action === 'approve' || action === 'reject') {
                if (!reservation.spot) throw new Error('SPOT_NOT_FOUND');

                const propertyOwner = await PropertyUser.findOne({
                    where: {
                        propertyId: reservation.spot.propertyId,
                        role: 'DONO'
                    },
                    transaction
                });

                if (!propertyOwner || propertyOwner.userId !== userId) {
                    throw new Error('FORBIDDEN');
                }
            }

            const statusMap = {
                approve: 'APROVADA',
                reject: 'RECUSADA',
                cancel: 'CANCELADA',
            } as const;

            await reservation.update({ status: statusMap[action] }, { transaction });
            await this.syncSpotStatus(reservation.spotId, transaction);
            await transaction.commit();

            if (action === 'approve') this.notifyUser(reservation.userId, 'RESERVATION_APPROVED', id);
            if (action === 'reject') this.notifyUser(reservation.userId, 'RESERVATION_REJECTED', id);

            return this.getById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async getMyReservations(userId: number) {
        return Reservation.findAll({
            where: { userId },
            include: [
                {
                    model: Spot,
                    as: 'spot',
                    attributes: ['id', 'identifier', 'price'],
                    include: [{ model: Property, as: 'property', attributes: ['name'] }]
                },
                { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'licensePlate'] },
            ],
            order: [['startDate', 'DESC'], ['endDate', 'DESC']],
        });
    }

    static async getOwnerReservationRequests(userId: number) {
        const properties = await PropertyUser.findAll({
            where: { userId, role: 'DONO' },
            attributes: ['propertyId']
        });

        const propertyIds = properties.map((property) => property.propertyId);

        if (propertyIds.length === 0) {
            return [];
        }

        return Reservation.findAll({
            where: { status: 'PENDENTE' },
            include: [
                {
                    model: Spot,
                    as: 'spot',
                    attributes: ['id', 'identifier', 'price', 'propertyId'],
                    where: { propertyId: propertyIds },
                    include: [{ model: Property, as: 'property', attributes: ['id', 'name'] }]
                },
                { model: User, as: 'user', attributes: ['id', 'email'] },
                { model: Vehicle, as: 'vehicle', attributes: ['id', 'brand', 'model', 'licensePlate'] },
            ],
            order: [['startDate', 'DESC']],
        });
    }

    static async getById(id: number) {
        return Reservation.findByPk(id, {
            include: [
                { model: Spot, as: 'spot' },
                { model: Vehicle, as: 'vehicle' },
                { model: User, as: 'user', attributes: ['id', 'email'] },
            ]
        });
    }

    private static notifyOwner(ownerId: number, event: string, reservationId: number) {
        console.log(`[NOTIFY OWNER ${ownerId}] Event: ${event}, Reservation: ${reservationId}`);
    }

    private static notifyUser(userId: number, event: string, reservationId: number) {
        console.log(`[NOTIFY USER ${userId}] Event: ${event}, Reservation: ${reservationId}`);
    }

    private static async syncSpotStatus(spotId: number, transaction: Transaction) {
        const spot = await Spot.findByPk(spotId, { transaction });
        if (!spot) {
            return;
        }

        const today = getCurrentDateString();
        const activeReservations = await Reservation.count({
            where: {
                spotId,
                status: { [Op.in]: ['PENDENTE', 'APROVADA'] },
                startDate: { [Op.lte]: today },
                endDate: { [Op.gte]: today }
            },
            transaction
        });

        const nextStatus =
            activeReservations > 0
                ? 'OCUPADA'
                : spot.approvalStatus === 'APROVADA'
                    ? 'DISPONIVEL'
                    : 'INDISPONIVEL';

        if (spot.status !== nextStatus) {
            await spot.update({ status: nextStatus }, { transaction });
        }
    }
}
