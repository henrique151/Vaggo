import User from '../models/User';
import Spot from '../models/Spot';
import Property from '../models/Property';
import Reservation from '../models/Reservation';
import Report from '../models/Report';

export class DashboardService {
    static async getDashboardStats() {
        const [
            totalUsers,
            blockedUsers,
            totalProperties,
            totalSpots,
            totalReservations,
            activeReservations,
            canceledReservations,
            pendingReports
        ] = await Promise.all([
            User.count(),
            User.count({ where: { isBlocked: true } }),
            Property.count(),
            Spot.count(),
            Reservation.count(),
            Reservation.count({ where: { status: 'APROVADA' } }),
            Reservation.count({ where: { status: 'CANCELADA' } }),
            Report.count({ where: { status: 'PENDENTE' } })
        ]);

        return {
            users: {
                total: totalUsers,
                blocked: blockedUsers,
                active: totalUsers - blockedUsers
            },
            properties: {
                total: totalProperties
            },
            spots: {
                total: totalSpots
            },
            reservations: {
                total: totalReservations,
                active: activeReservations,
                canceled: canceledReservations
            },
            reports: {
                pending: pendingReports
            }
        };
    }
}
