import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotSearchService } from '../services/SpotSearchService';
import { SearchByAddressInput, searchByAddressSchema } from '../schemas/spotSearchSchema';

export const searchByAddress = asyncHandler(async (req: Request, res: Response) => {
    const params = searchByAddressSchema.parse(req.query) as SearchByAddressInput;
    const data = await SpotSearchService.searchByAddress(params);

    res.status(200).json({
        success: true,
        searchOrigin: data.searchOrigin,
        requestedRadiusKm: data.requestedRadiusKm,
        requestedPeriod: data.requestedPeriod,
        fallbackToNearest: data.fallbackToNearest,
        total: data.results.length,
        results: data.results,
    });
});
