import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotSearchService } from '../services/SpotSearchService';
import { SearchByAddressInput, searchByAddressSchema } from '../schemas/spotSearchSchema';

export const searchByAddress = asyncHandler(async (req: Request, res: Response) => {
    const params = searchByAddressSchema.parse(req.query) as SearchByAddressInput;
    const result = await SpotSearchService.searchByAddress(params);

    res.status(200).json({
        success: true,
        searchOrigin: result.searchOrigin,
        requestedRadiusKm: result.requestedRadiusKm,
        requestedPeriod: result.requestedPeriod,
        fallbackToNearest: result.fallbackToNearest,
        total: result.results.length,
        data: result.results,
    });
});
