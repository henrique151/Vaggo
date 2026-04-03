export interface SpotAttributes {
    id: number;
    size: number;
    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA';
    identifier: string;
    isCovered: boolean;
    isActive: boolean;
    propertyId: number;
}
