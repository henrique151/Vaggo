export interface SpotAttributes {
    id: number;
    price: number;
    size: number;
    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA';
    identifier: string;
    approvalStatus: 'PENDENTE' | 'APROVADA' | 'RECUSADA';
    allowedVehicles: ('CARRO' | 'MOTO')[];
    isCovered: boolean;
    isActive: boolean;
    propertyId: number;
    imageUrl: string;
}
