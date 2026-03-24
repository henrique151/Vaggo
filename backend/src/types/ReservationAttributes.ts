export interface ReservationAttributes {
    id: number;
    status: 'AGENDADA' | 'EM ANDAMENTO' | 'CONCLUIDA' | 'DESCONHECIDO';
    startDate: Date;
    endDate: Date;
    totalValue: number;
    createdAtDate: Date;
    confirmationCode: string;
    vehicleId: number;
    spotId: number;
}