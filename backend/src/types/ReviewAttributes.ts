export interface ReviewAttributes {
    id: number;
    rating: number | null;
    comment: string;
    reviewDate: Date;
    userId: number;
    propertyId: number;
}