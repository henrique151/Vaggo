import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotSearchService } from '../services/SpotSearchService';
import { SearchByAddressInput, searchByAddressSchema } from '../schemas/spotSearchSchema';

export const searchByAddress = asyncHandler(async (req: Request, res: Response) => {
    try {
        const params = searchByAddressSchema.parse(req.query) as SearchByAddressInput;
        const result = await SpotSearchService.searchByAddress(params);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const requestId = req.headers['x-request-id'] || 'unknown';

        console.warn(`[spotSearchController] Erro na busca por endereco - RequestID: ${requestId}:`, {
            errorMessage,
            query: req.query,
            timestamp: new Date().toISOString()
        });

        if (errorMessage === 'CEP_NOT_FOUND') {
            return res.status(400).json({
                success: false,
                message: 'CEP nao encontrado. Verifique o CEP informado.'
            });
        }

        if (errorMessage === 'CEP_INVALID_FORMAT') {
            return res.status(400).json({
                success: false,
                message: 'CEP invalido. Deve conter 8 digitos.'
            });
        }

        if (errorMessage === 'ADDRESS_NOT_FOUND') {
            return res.status(400).json({
                success: false,
                message: 'Endereco nao encontrado. Tente novamente com um endereco diferente.'
            });
        }

        if (errorMessage === 'GEOCODING_FAILED') {
            return res.status(503).json({
                success: false,
                message: 'Nao foi possivel localizar as coordenadas do CEP. Tente novamente mais tarde.',
                requestId: String(requestId)
            });
        }

        if (errorMessage === 'EXTERNAL_API_FAILURE') {
            console.error(`[spotSearchController] EXTERNAL_API_FAILURE - RequestID: ${requestId}:`, {
                query: req.query,
                timestamp: new Date().toISOString()
            });

            return res.status(503).json({
                success: false,
                message: 'Servico de busca de CEP indisponivel no momento. Tente novamente mais tarde.',
                requestId: String(requestId)
            });
        }

        throw error;
    }
});
