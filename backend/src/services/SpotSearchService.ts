import { QueryTypes } from 'sequelize';
import sequelize from '../database';
import { ExternalAddressService } from './ExternalAddressService';
import { GoogleMapsService } from './GoogleMapsService';
import {
    HAVERSINE_SQL,
    SearchOrigin,
    SearchParams
} from '../types/SpotSearch';

export class SpotSearchService {
    static async searchByAddress(params: SearchParams) {
        const searchOrigin = await this.resolveSearchOrigin(params);
        const radius = params.radius || 10;

        let results = await this.queryAvailableProperties({
            ...searchOrigin,
            radius,
            limit: 50,
        });

        let fallbackToNearest = false;

        if (results.length === 0) {
            results = await this.queryAvailableProperties({
                ...searchOrigin,
                limit: 1,
            });
            fallbackToNearest = results.length > 0;
        }

        const enriched = results.map((property) => ({
            id: property.userId,
            name: property.ownerName,
            phone: property.ownerPhone,
            avatarUrl: property.avatarUrl,
            distanceKm: Number(property.distanceKm),
            property: {
                name: property.propertyName,
                image: Array.isArray(property.propertyImages) && property.propertyImages.length > 0
                    ? property.propertyImages[0]
                    : null
            }
        }));

        return {
            data: enriched
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

    private static async queryAvailableProperties(params: {
        lat: number;
        lng: number;
        radius?: number;
        limit: number;
    }) {
        const radiusClause = typeof params.radius === 'number'
            ? `AND ${HAVERSINE_SQL} <= :radius`
            : '';

        return sequelize.query<any>(`
            SELECT DISTINCT
                p."PRO_INT_ID" AS "propertyId",
                p."PRO_STR_NOME" AS "propertyName",
                p."PRO_JSON_IMAGENS" AS "propertyImages",
                p."PRO_DEC_LATITUDE" AS "propertyLat",
                p."PRO_DEC_LONGITUDE" AS "propertyLng",
                u."USU_INT_ID" AS "userId",
                u."USU_STR_AVATAR_URL" AS "avatarUrl",
                per."PES_STR_NOME" AS "ownerName",
                per."PES_STR_PHONE" AS "ownerPhone",
                ROUND(CAST(${HAVERSINE_SQL} AS numeric), 2) AS "distanceKm"
            FROM properties p
            LEFT JOIN properties_users pu ON p."PRO_INT_ID" = pu."PRO_INT_ID"
            LEFT JOIN users u ON pu."USU_INT_ID" = u."USU_INT_ID"
            LEFT JOIN persons per ON u."PES_INT_ID" = per."PES_INT_ID"
            WHERE
                p."PRO_BOL_ATIVA" = true
                AND p."PRO_DEC_LATITUDE" IS NOT NULL
                AND p."PRO_DEC_LONGITUDE" IS NOT NULL
                ${radiusClause}
            ORDER BY "distanceKm" ASC
            LIMIT :limit
        `, {
            replacements: {
                lat: params.lat,
                lng: params.lng,
                radius: params.radius,
                limit: params.limit,
            },
            type: QueryTypes.SELECT,
        });
    }
}
