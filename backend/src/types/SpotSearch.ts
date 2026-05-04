export const HAVERSINE_SQL = `
    (6371 * acos(
        cos(radians(:lat)) * cos(radians(p."PRO_DEC_LATITUDE"))
        * cos(radians(p."PRO_DEC_LONGITUDE") - radians(:lng))
        + sin(radians(:lat)) * sin(radians(p."PRO_DEC_LATITUDE"))
    ))
`;

export const RESERVATION_PERIOD_CONFLICT_SQL = `
    EXISTS (
        SELECT 1 FROM reservations r
        WHERE r."VAG_INT_ID" = s."VAG_INT_ID"
        AND r."RES_STR_STATUS" IN ('PENDENTE', 'APROVADA')
        AND r."RES_DATE_START" <= :requestedEndDate
        AND r."RES_DATE_END" >= :requestedStartDate
    )
`;

export type SearchParams = {
    address?: string;
    cep?: string;
    lat?: number;
    lng?: number;
    startDate?: string;
    endDate?: string;
    radius?: number;
};

export type SearchOrigin = {
    lat: number;
    lng: number;
    query: string;
    source: 'address' | 'cep' | 'coordinates';
};

export type SpotSearchRow = {
    spotId: number;
    identifier: string;
    size: string;
    isCovered: boolean;
    price: string;
    allowedVehicles: string[];
    currentStatus: string;
    propertyId: number;
    propertyName: string;
    propertyLat: number;
    propertyLng: number;
    weekdaysBitmask: number;
    availableFrom: string | null;
    availableUntil: string | null;
    timeStart: string;
    timeEnd: string;
    distanceKm: string | number;
};
