const MIN_SPOT_SIZE_REQUIRED: Record<string, number> = {
    MOTO: 2.5,
    PEQUENO: 10.0, 
    MEDIO: 13.0,  
    GRANDE: 15.0   
};

export class CompatibilityService {
    static validate(vehicleSize: string, spotSizeStr: string, vehicleType: string): void {
        const lookupKey = vehicleType === 'MOTO' ? 'MOTO' : vehicleSize.toUpperCase();

        const minimumRequiredSize = MIN_SPOT_SIZE_REQUIRED[lookupKey];
        const spotSize = parseFloat(spotSizeStr); 

        if (!minimumRequiredSize) {
            throw new Error('VEHICLE_SIZE_UNKNOWN'); 
        }

        if (spotSize < minimumRequiredSize) {
            const error = new Error('VEHICLE_INCOMPATIBLE') as any;
            error.details = [`A vaga (${spotSize}m²) é muito pequena para um veículo ${lookupKey} (Mínimo: ${minimumRequiredSize}m²)`];
            throw error;
        }
    }
}