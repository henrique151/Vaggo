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

        // Mapear erros específicos para respostas apropriadas
        if (errorMessage === 'CEP_NOT_FOUND') {
            return res.status(400).json({
                success: false,
                message: 'CEP não encontrado. Verifique o CEP informado.'
            });
        }

        if (errorMessage === 'CEP_INVALID_FORMAT') {
            return res.status(400).json({
                success: false,
                message: 'CEP inválido. Deve conter 8 dígitos.'
            });
        }

        if (errorMessage === 'ADDRESS_NOT_FOUND') {
            return res.status(400).json({
                success: false,
                message: 'Endereço não encontrado. Tente novamente com um endereço diferente.'
            });
        }

        if (errorMessage === 'GEOCODING_FAILED') {
            return res.status(400).json({
                success: false,
                message: 'Não foi possível localizar as coordenadas do CEP. Tente novamente.'
            });
        }

        if (errorMessage === 'EXTERNAL_API_FAILURE') {
            return res.status(503).json({
                success: false,
                message: 'Serviço de busca de CEP indisponível no momento. Tente novamente mais tarde.'
            });
        }

        // Re-lançar outros erros para o manipulador de erros global
        throw error;
    }
});
