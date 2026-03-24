export interface SpotAttributes {
    id: number;
    size: number;
    status: 'DISPONÍVEL' | 'INDISPONÍVEL' | 'OCUPADA';
    identifier: string;
    isCovered: boolean;
    isActive: boolean;
    propertyId: number;
}
