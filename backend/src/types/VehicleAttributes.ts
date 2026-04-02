export interface VehicleAttributes {
    id: number;
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    manufactureYear: string;
    type: 'CARRO' | 'MOTO';
    size: 'PEQUENO' | 'MEDIO' | 'GRANDE';
    isActive: boolean;
    userId: number;
}

