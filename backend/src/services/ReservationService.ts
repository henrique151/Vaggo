import crypto from 'crypto';
import type { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../database';
import Reservation from '../models/Reservation';
import Spot from '../models/Spot';
import SpotAvailability from '../models/SpotAvailabilities';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import Person from '../models/Person';
import Conversation from '../models/Conversation';
import Property from '../models/Property';
import PropertyUser from '../models/PropertyUser';
import { CreateReservationInput } from '../schemas/reservationsSchema';
import { getCurrentDateString, isRangeWithinAvailability } from '../utils/dateRange';
import { ChatService } from './ChatService';
import TwilioWhatsAppService from './TwilioWhatsAppService';

export interface AdminReservationFilters {
    id?: number;
    email?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    city?: string;
}

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
                const conversation = await ChatService.createConversationForReservation({
                    solicitationId: reservation.id,
                    propertyId: spot.propertyId,
                    userRequesterId: data.userId,
                    userOwnerId: propertyOwner.userId,
                });
                this.notifyOwner(propertyOwner.userId, reservation.id, conversation.id);
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

            if (action === 'approve') this.notifyReservationApproved(reservation.userId, userId, id);
            if (action === 'reject') this.notifyReservationRejected(reservation.userId, id);

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

    static async getAllReservations() {
        return Reservation.findAll({
            include: [
                {
                    model: Spot,
                    as: 'spot',
                    attributes: ['id', 'identifier', 'price'],
                    include: [{
                        model: Property,
                        as: 'property',
                        attributes: ['name'],
                        include: [{
                            model: PropertyUser,
                            as: 'propertyUsers',
                            where: { role: 'DONO' },
                            include: [{
                                model: User,
                                as: 'user',
                                attributes: ['id', 'email'],
                                include: [{ model: Person, as: 'person', attributes: ['name'] }]
                            }]
                        }]
                    }]
                },
                { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'licensePlate'] },
                { model: User, as: 'user', attributes: ['id', 'email'] },
            ],
            order: [['startDate', 'DESC']],
        });
    }

    static async searchAdminReservations(filters: AdminReservationFilters = {}) {
        const whereClause: any = {};
        const userWhere: any = {};

        if (filters.id) {
            whereClause.id = filters.id;
        }

        if (filters.status) {
            whereClause.status = filters.status;
        }

        if (filters.startDate) {
            whereClause.startDate = { [Op.gte]: filters.startDate };
        }

        if (filters.endDate) {
            whereClause.endDate = { [Op.lte]: filters.endDate };
        }

        if (filters.email) {
            userWhere.email = { [Op.iLike]: `%${filters.email}%` };
        }

        const hasUserFilter = Object.keys(userWhere).length > 0;

        return Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Spot,
                    as: 'spot',
                    attributes: ['id', 'identifier', 'price'],
                    include: [
                        {
                            model: Property,
                            as: 'property',
                            attributes: ['name'],
                            include: [{
                                model: PropertyUser,
                                as: 'propertyUsers',
                                where: { role: 'DONO' },
                                include: [{
                                    model: User,
                                    as: 'user',
                                    attributes: ['id', 'email'],
                                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                                }]
                            }]
                        }
                    ]
                },
                { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'color', 'licensePlate'] },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email'],
                    where: hasUserFilter ? userWhere : undefined,
                    required: hasUserFilter,
                    include: [{ model: Person, as: 'person', attributes: ['name', 'phone'] }]
                },
            ],
            order: [['startDate', 'DESC']],
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

    static async deleteReservation(id: number) {
        const transaction = await sequelize.transaction();
        try {
            const reservation = await Reservation.findByPk(id, { transaction });
            if (!reservation) throw new Error('RESERVATION_NOT_FOUND');

            const spotId = reservation.spotId;

            await reservation.destroy({ transaction });
            await this.syncSpotStatus(spotId, transaction);
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async forceCancelReservation(id: number) {
        const transaction = await sequelize.transaction();
        try {
            const reservation = await Reservation.findByPk(id, { transaction });
            if (!reservation) throw new Error('RESERVATION_NOT_FOUND');

            const spotId = reservation.spotId;
            await reservation.update({ status: 'CANCELADA' }, { transaction });
            await this.syncSpotStatus(spotId, transaction);
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private static notifyOwner(ownerId: number, reservationId: number, conversationId: number): void {
        TwilioWhatsAppService.dispatchInBackground(async () => {
            const [owner, reservation] = await Promise.all([
                User.findByPk(ownerId, { include: [{ model: Person, as: 'person' }] }),
                Reservation.findByPk(reservationId, { include: [{ model: Spot, as: 'spot' }] }),
            ]);

            if (!owner?.person?.phone || !reservation?.spot) {
                throw new Error('NOTIFICATION_CONTEXT_NOT_FOUND');
            }

            await TwilioWhatsAppService.sendRentalRequestAlert(
                owner.person.phone,
                owner.person.name,
                reservation.spot.identifier
            );

            return TwilioWhatsAppService.sendNewChatMessage(
                owner.person.phone,
                'Vaggo',
                conversationId
            );
        });
    }

    private static notifyReservationApproved(userId: number, ownerId: number, reservationId: number): void {
        TwilioWhatsAppService.dispatchInBackground(async () => {
            const [user, owner, reservation, conversation] = await Promise.all([
                User.findByPk(userId, { include: [{ model: Person, as: 'person' }] }),
                User.findByPk(ownerId, { include: [{ model: Person, as: 'person' }] }),
                Reservation.findByPk(reservationId, { include: [{ model: Spot, as: 'spot' }] }),
                Conversation.findOne({ where: { solicitationId: reservationId } }),
            ]);

            if (!user?.person?.phone || !owner?.person?.name || !reservation?.spot || !conversation) {
                throw new Error('NOTIFICATION_CONTEXT_NOT_FOUND');
            }

            return TwilioWhatsAppService.sendRentalApprovedAlert(
                user.person.phone,
                user.person.name,
                reservation.spot.identifier,
                owner.person.name,
                conversation.id
            );
        });
    }

    private static notifyReservationRejected(userId: number, reservationId: number): void {
        console.log(`[NOTIFY USER ${userId}] Event: RESERVATION_REJECTED, Reservation: ${reservationId}`);
        TwilioWhatsAppService.dispatchInBackground(async () => {
            const [user, reservation] = await Promise.all([
                User.findByPk(userId, { include: [{ model: Person, as: 'person' }] }),
                Reservation.findByPk(reservationId, {
                    include: [
                        {
                            model: Spot,
                            as: 'spot',
                            include: [
                                {
                                    model: Property,
                                    as: 'property'
                                }
                            ]
                        }
                    ]
                }),
            ]);

            if (!user?.person?.phone || !reservation?.spot) {
                throw new Error('NOTIFICATION_CONTEXT_NOT_FOUND');
            }

            const propertyOwner = await PropertyUser.findOne({
                where: { propertyId: reservation.spot.propertyId, role: 'DONO' },
                include: [{ model: User, as: 'user', include: [{ model: Person, as: 'person' }] }]
            });

            const ownerName = (propertyOwner as any)?.user?.person?.name || 'O Proprietário';

            return TwilioWhatsAppService.sendRentalRejectedAlert(
                user.person.phone,
                user.person.name,
                reservation.spot.identifier,
                ownerName
            );
        });
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
