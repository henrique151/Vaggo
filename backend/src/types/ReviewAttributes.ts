export interface ReviewAttributes {
    id: number;
    rating: number;
    comment: string;
    reviewDate: Date;
    userId: number;
    spotId: number;
    propertyId: number;
    reservationId: number;
}
