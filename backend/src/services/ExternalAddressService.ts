import axios from 'axios';
import { GoogleMapsService } from './GoogleMapsService';

type ViaCepResponse = {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    ibge?: string;
    uf?: string;
};

interface CacheEntry {
    data: any;
    expiresAt: number;
}

const CEP_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

export class ExternalAddressService {
    private static getCachedAddress(cep: string) {
        const cached = CEP_CACHE.get(cep);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }

        return null;
    }

    private static setCacheAddress(cep: string, data: any) {
        CEP_CACHE.set(cep, {
            data,
            expiresAt: Date.now() + CACHE_TTL
        });
    }

    static async getAddressByCep(cep: string) {
        const cleanCep = cep.replace(/\D/g, '');
        const cached = this.getCachedAddress(cleanCep);
        if (cached) {
            return cached;
        }

        try {
            const { data } = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (data.erro || !data.ibge || !data.uf || !data.localidade) {
                throw new Error('CEP_NOT_FOUND');
            }

            const coordinates = await this.getCoordinatesFromCep(cleanCep, data);
            const result = {
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                cityName: data.localidade,
                cityIbgeCode: Number(data.ibge),
                stateUf: data.uf,
                latitude: coordinates.lat,
                longitude: coordinates.lng
            };

            this.setCacheAddress(cleanCep, result);
            return result;
        } catch (error) {
            if (error instanceof Error && ['CEP_NOT_FOUND', 'GEOCODING_FAILED'].includes(error.message)) {
                throw error;
            }

            throw new Error('EXTERNAL_API_FAILURE');
        }
    }

    private static async getCoordinatesFromCep(cep: string, data: ViaCepResponse) {
        const queries = [
            [data.logradouro, data.bairro, data.localidade, data.uf, 'Brasil', cep].filter(Boolean).join(', '),
            [cep, data.localidade, data.uf, 'Brasil'].filter(Boolean).join(', ')
        ];

        for (const query of queries) {
            const coordinates = await GoogleMapsService.geocode(query);
            if (coordinates) {
                return coordinates;
            }
        }

        throw new Error('GEOCODING_FAILED');
    }
}
