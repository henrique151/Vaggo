export interface ReservationAttributes {
    id: number;
    spotId: number;
    vehicleId: number;
    userId: number;
    startDate: string;
    endDate: string;
    status: 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'CANCELADA';
    code: string;
}
