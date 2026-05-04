export interface SpotAvailabilityAttributes {
    id: number;
    spotId: number;
    weekdays: number;
    startDate: string | null;
    endDate: string | null;
    startTime: string;
    endTime: string;
}
