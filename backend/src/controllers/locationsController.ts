import { Request, Response } from "express";
import { LocationService } from "../services/LocationService";
import { asyncHandler } from "../utils/asyncHandler";


export const getStates = asyncHandler(async (req: Request, res: Response) => {
    const data = await LocationService.getStates();
    res.status(200).json({ success: true, data });
})

export const getCitiesState = asyncHandler(async (req: Request, res: Response) => {
    const stateId = Number(req.params.stateId);
    const data = await LocationService.getCitiesByState(stateId);
    res.status(200).json({ success: true, data })
})