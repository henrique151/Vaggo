import axios, { AxiosError } from 'axios';
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
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

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

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private static getErrorDetails(error: any): { type: string; message: string; code?: string; status?: number } {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.code === 'ECONNABORTED') {
                return { type: 'TIMEOUT', message: 'Timeout na requisição ViaCep', code: axiosError.code };
            }
            if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
                return { type: 'NETWORK_ERROR', message: 'Falha de conexão com ViaCep', code: axiosError.code };
            }
            if (axiosError.response?.status === 429) {
                return { type: 'RATE_LIMIT', message: 'ViaCep retornou 429 - limite de requisições excedido', status: 429 };
            }
            if (axiosError.response?.status) {
                return { type: 'HTTP_ERROR', message: `ViaCep retornou ${axiosError.response.status}`, status: axiosError.response.status };
            }
            return { type: 'AXIOS_ERROR', message: axiosError.message, code: axiosError.code };
        }
        
        if (error instanceof Error) {
            return { type: 'ERROR', message: error.message };
        }
        
        return { type: 'UNKNOWN_ERROR', message: String(error) };
    }

    static async getAddressByCep(cep: string): Promise<any> {
        const cleanCep = cep.replace(/\D/g, '');
        const cached = this.getCachedAddress(cleanCep);

        if (cached) {
            console.info(`[ExternalAddressService] CEP ${cleanCep} encontrado em cache`);
            return cached;
        }

        // Validar CEP antes de fazer a requisição
        if (cleanCep.length !== 8 || !/^\d+$/.test(cleanCep)) {
            console.warn(`[ExternalAddressService] CEP inválido: ${cleanCep}`);
            throw new Error('CEP_INVALID_FORMAT');
        }

        let lastError: any = null;
        const startTime = Date.now();

        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                console.info(`[ExternalAddressService] Tentativa ${attempt}/${MAX_RETRY_ATTEMPTS} para CEP ${cleanCep}`);

                const { data } = await axios.get<ViaCepResponse>(
                    `https://viacep.com.br/ws/${cleanCep}/json/`,
                    { timeout: 5000 }
                );

                if (data.erro || !data.ibge || !data.uf || !data.localidade) {
                    console.warn(`[ExternalAddressService] CEP ${cleanCep} não encontrado na API`);
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
                const duration = Date.now() - startTime;
                console.info(`[ExternalAddressService] CEP ${cleanCep} resolvido com sucesso em ${duration}ms (tentativa ${attempt})`);
                return result;
            } catch (error) {
                lastError = error;
                const errorDetails = this.getErrorDetails(error);

                if (error instanceof Error && ['CEP_NOT_FOUND', 'GEOCODING_FAILED', 'CEP_INVALID_FORMAT'].includes(error.message)) {
                    throw error;
                }

                console.warn(`[ExternalAddressService] Erro na tentativa ${attempt}/${MAX_RETRY_ATTEMPTS}:`, {
                    cep: cleanCep,
                    errorType: errorDetails.type,
                    errorMessage: errorDetails.message,
                    errorCode: errorDetails.code || errorDetails.status,
                    timestamp: new Date().toISOString()
                });

                // Se for a última tentativa, não faz retry
                if (attempt === MAX_RETRY_ATTEMPTS) {
                    break;
                }

                // Exponential backoff: 1s, 2s, 4s
                const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.info(`[ExternalAddressService] Aguardando ${delayMs}ms antes da próxima tentativa...`);
                await this.sleep(delayMs);
            }
        }

        // Após todas as tentativas falharem, log final
        const errorDetails = this.getErrorDetails(lastError);
        const duration = Date.now() - startTime;
        console.error(`[ExternalAddressService] Falha final ao buscar CEP ${cleanCep} após ${MAX_RETRY_ATTEMPTS} tentativas (${duration}ms):`, {
            cep: cleanCep,
            errorType: errorDetails.type,
            errorMessage: errorDetails.message,
            errorCode: errorDetails.code || errorDetails.status,
            timestamp: new Date().toISOString()
        });

        throw new Error('EXTERNAL_API_FAILURE');
    }

    private static async getCoordinatesFromCep(cep: string, data: ViaCepResponse) {
        const queries = [
            [data.logradouro, data.bairro, data.localidade, data.uf, 'Brasil', cep].filter(Boolean).join(', '),
            [cep, data.localidade, data.uf, 'Brasil'].filter(Boolean).join(', ')
        ];

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            try {
                console.info(`[ExternalAddressService] Geocodificando query ${i + 1}/${queries.length}: "${query}"`);
                const coordinates = await GoogleMapsService.geocode(query);
                if (coordinates) {
                    console.info(`[ExternalAddressService] Geocodificação bem-sucedida para query "${query}"`);
                    return coordinates;
                }
            } catch (error) {
                const errorDetails = this.getErrorDetails(error);
                console.warn(`[ExternalAddressService] Falha ao geocodificar query ${i + 1}:`, {
                    query,
                    errorType: errorDetails.type,
                    errorMessage: errorDetails.message,
                    timestamp: new Date().toISOString()
                });
                // Continua para a próxima query
            }
        }

        console.error(`[ExternalAddressService] Todas as queries de geocodificação falharam para CEP ${cep}`);
        throw new Error('GEOCODING_FAILED');
    }
}
