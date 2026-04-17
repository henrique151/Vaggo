export interface SpotAttributes {
    id: number;
    price: number;
    size: number;
    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA';
    identifier: string;
    approvalStatus: 'PENDENTE' | 'APROVADA' | 'RECUSADA';
    allowedVehicles: ('CARRO' | 'MOTO')[];
    operatingHours: Record<string, { start: string; end: string }> | null;
    isCovered: boolean;
    isActive: boolean;
    propertyId: number;
}
