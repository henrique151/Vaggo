export interface PropertyUserAttributes {
    id: number;
    userId: number;
    propertyId: number;
    role: 'MORADOR' | 'DONO';
}