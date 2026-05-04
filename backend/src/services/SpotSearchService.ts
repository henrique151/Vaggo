import { QueryTypes } from 'sequelize';
import sequelize from '../database';
import { ExternalAddressService } from './ExternalAddressService';
import { GoogleMapsService } from './GoogleMapsService';
import {
    HAVERSINE_SQL,
    RESERVATION_PERIOD_CONFLICT_SQL,
    SearchOrigin,
    SearchParams,
    SpotSearchRow
} from '../types/SpotSearch';
import { buildWeekdayMask, getCurrentDateString } from '../utils/dateRange';

function decodeWeekdays(bitmask: number): string[] {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return days.filter((_, index) => (bitmask & (1 << index)) > 0);
}

export class SpotSearchService {
    static async searchByAddress(params: SearchParams) {
        const searchOrigin = await this.resolveSearchOrigin(params);
        const radius = params.radius || 10;
        const today = getCurrentDateString();
        const effectiveStartDate = params.startDate ?? today;
        const effectiveEndDate = params.endDate ?? today;
        const effectiveWeekdayMask = buildWeekdayMask(effectiveStartDate, effectiveEndDate);

        let results = await this.queryAvailableSpots({
            ...searchOrigin,
            radius,
            limit: 50,
            requestedStartDate: effectiveStartDate,
            requestedEndDate: effectiveEndDate,
            requestedWeekdayMask: effectiveWeekdayMask
        });

        let fallbackToNearest = false;

        if (results.length === 0) {
            results = await this.queryAvailableSpots({
                ...searchOrigin,
                limit: 1,
                requestedStartDate: effectiveStartDate,
                requestedEndDate: effectiveEndDate,
                requestedWeekdayMask: effectiveWeekdayMask
            });
            fallbackToNearest = results.length > 0;
        }

        const enriched = await Promise.all(
            results.map(async (spot) => {
                const route = await GoogleMapsService.getDirections(
                    { lat: searchOrigin.lat, lng: searchOrigin.lng },
                    { lat: Number(spot.propertyLat), lng: Number(spot.propertyLng) }
                );

                return {
                    ...spot,
                    distanceKm: Number(spot.distanceKm),
                    weekdays: decodeWeekdays(Number(spot.weekdaysBitmask)),
                    route: route || null,
                    withinRequestedRadius: !fallbackToNearest,
                };
            })
        );

        return {
            searchOrigin: {
                lat: searchOrigin.lat,
                lng: searchOrigin.lng,
                query: searchOrigin.query,
                source: searchOrigin.source
            },
            requestedRadiusKm: radius,
            requestedPeriod:
                params.startDate && params.endDate
                    ? {
                        startDate: params.startDate,
                        endDate: params.endDate
                    }
                    : null,
            fallbackToNearest,
            results: enriched
        };
    }

    private static async resolveSearchOrigin(params: SearchParams): Promise<SearchOrigin> {
        if (typeof params.lat === 'number' && typeof params.lng === 'number') {
            return {
                lat: params.lat,
                lng: params.lng,
                query: `${params.lat},${params.lng}`,
                source: 'coordinates'
            };
        }

        if (params.cep) {
            const addressData = await ExternalAddressService.getAddressByCep(params.cep);

            return {
                lat: addressData.latitude,
                lng: addressData.longitude,
                query: params.cep,
                source: 'cep'
            };
        }

        const coords = await GoogleMapsService.geocode(params.address!);
        if (!coords) throw new Error('ADDRESS_NOT_FOUND');

        return {
            lat: coords.lat,
            lng: coords.lng,
            query: params.address!,
            source: 'address'
        };
    }

    private static async queryAvailableSpots(params: {
        lat: number;
        lng: number;
        requestedStartDate: string;
        requestedEndDate: string;
        requestedWeekdayMask: number;
        radius?: number;
        limit: number;
    }) {
        const radiusClause = typeof params.radius === 'number'
            ? `AND ${HAVERSINE_SQL} <= :radius`
            : '';

        return sequelize.query<SpotSearchRow>(`
            SELECT
                s."VAG_INT_ID" AS "spotId",
                s."VAG_STR_IDENTIFICADOR" AS "identifier",
                s."VAG_DEC_TAMANHO" AS "size",
                s."VAG_BOL_COBERTA" AS "isCovered",
                s."VAG_DEC_PRECO" AS "price",
                s."VAG_JSN_VEICULOS_PERMITIDOS" AS "allowedVehicles",
                s."VAG_STR_OCUPADA" AS "currentStatus",
                p."PRO_INT_ID" AS "propertyId",
                p."PRO_STR_NOME" AS "propertyName",
                p."PRO_DEC_LATITUDE" AS "propertyLat",
                p."PRO_DEC_LONGITUDE" AS "propertyLng",
                sa."SAV_INT_WEEKDAYS" AS "weekdaysBitmask",
                sa."SAV_DATE_START" AS "availableFrom",
                sa."SAV_DATE_END" AS "availableUntil",
                sa."SAV_TIME_START" AS "timeStart",
                sa."SAV_TIME_END" AS "timeEnd",
                ROUND(CAST(${HAVERSINE_SQL} AS numeric), 2) AS "distanceKm"
            FROM spots s
            INNER JOIN properties p ON s."PRO_INT_ID" = p."PRO_INT_ID"
            INNER JOIN spot_availabilities sa ON sa."VAG_INT_ID" = s."VAG_INT_ID"
            WHERE
                s."VAG_STR_STATUS_APROVACAO" = 'APROVADA'
                AND s."VAG_BOL_ATIVA" = true
                AND s."VAG_STR_OCUPADA" <> 'INDISPONIVEL'
                AND p."PRO_DEC_LATITUDE" IS NOT NULL
                AND p."PRO_DEC_LONGITUDE" IS NOT NULL
                AND (sa."SAV_DATE_START" IS NULL OR sa."SAV_DATE_START" <= :requestedStartDate)
                AND (sa."SAV_DATE_END" IS NULL OR sa."SAV_DATE_END" >= :requestedEndDate)
                AND (sa."SAV_INT_WEEKDAYS" & :requestedWeekdayMask) = :requestedWeekdayMask
                AND NOT ${RESERVATION_PERIOD_CONFLICT_SQL}
                ${radiusClause}
            ORDER BY "distanceKm" ASC
            LIMIT :limit
        `, {
            replacements: {
                lat: params.lat,
                lng: params.lng,
                requestedStartDate: params.requestedStartDate,
                requestedEndDate: params.requestedEndDate,
                requestedWeekdayMask: params.requestedWeekdayMask,
                radius: params.radius,
                limit: params.limit,
            },
            type: QueryTypes.SELECT,
        });
    }
}
