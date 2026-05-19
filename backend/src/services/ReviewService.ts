import Review from '../models/Review';
import Reservation from '../models/Reservation';
import Spot from '../models/Spot';
import Property from '../models/Property';
import User from '../models/User';
import { CreateReviewInput, UpdateReviewInput } from '../schemas/reviewsSchema';
import { getCurrentDateString } from '../utils/dateRange';

type ReviewListResult = {
    averageRating: number;
    total: number;
    data: unknown[];
};

export class ReviewService {
    private static readonly authorInclude = {
        model: User,
        as: 'author',
        attributes: ['id', 'email', 'avatarUrl']
    };

    private static readonly defaultInclude = [
        this.authorInclude,
        { model: Spot, as: 'spot', attributes: ['id', 'identifier', 'propertyId'] },
        { model: Property, as: 'property', attributes: ['id', 'name'] },
        { model: Reservation, as: 'reservation', attributes: ['id', 'startDate', 'endDate', 'status'] }
    ];

    static async createReview(userId: number, data: CreateReviewInput) {
        const reservation = await Reservation.findByPk(data.reservationId, {
            include: [{ model: Spot, as: 'spot' }]
        });

        if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
        if (reservation.userId !== userId) throw new Error('FORBIDDEN');
        if (reservation.status !== 'APROVADA' || reservation.endDate >= getCurrentDateString()) {
            throw new Error('RESERVATION_NOT_COMPLETED');
        }
        if (!reservation.spot) throw new Error('SPOT_NOT_FOUND');

        const review = await Review.create({
            userId,
            reservationId: reservation.id,
            spotId: reservation.spotId,
            propertyId: reservation.spot.propertyId,
            rating: data.rating,
            comment: data.comment ?? ''
        });

        return this.getById(review.id, userId);
    }

    static async getMyReviews(userId: number) {
        return Review.findAll({
            where: { userId },
            include: this.defaultInclude,
            order: [['reviewDate', 'DESC']]
        });
    }

    static async getReviewsByProperty(propertyId: number): Promise<ReviewListResult> {
        const reviews = await Review.findAll({
            where: { propertyId },
            include: [this.authorInclude],
            order: [['reviewDate', 'DESC']]
        });

        return this.buildPublicList(reviews);
    }

    static async getReviewsBySpot(spotId: number): Promise<ReviewListResult> {
        const reviews = await Review.findAll({
            where: { spotId },
            include: [this.authorInclude],
            order: [['reviewDate', 'DESC']]
        });

        return this.buildPublicList(reviews);
    }

    static async updateReview(id: number, userId: number, data: UpdateReviewInput) {
        const review = await Review.findByPk(id);
        if (!review) throw new Error('REVIEW_NOT_FOUND');
        if (review.userId !== userId) throw new Error('FORBIDDEN');

        await review.update(data);
        return this.getById(review.id, userId);
    }

    static async deleteReview(id: number, userId: number) {
        const review = await Review.findByPk(id);
        if (!review) throw new Error('REVIEW_NOT_FOUND');
        if (review.userId !== userId) throw new Error('FORBIDDEN');

        await review.destroy();
        return true;
    }

    private static async getById(id: number, userId: number) {
        const review = await Review.findByPk(id, {
            include: this.defaultInclude
        });

        if (!review) throw new Error('REVIEW_NOT_FOUND');
        if (review.userId !== userId) throw new Error('FORBIDDEN');

        return review;
    }

    private static buildPublicList(reviews: Review[]): ReviewListResult {
        const total = reviews.length;
        const averageRating = total
            ? Number((reviews.reduce((sum, review) => sum + Number(review.rating), 0) / total).toFixed(1))
            : 0;

        return {
            averageRating,
            total,
            data: reviews.map((review) => {
                const plain = review.toJSON() as unknown as Record<string, unknown>;
                plain.user = plain.author;
                delete plain.author;
                return plain;
            })
        };
    }
}
