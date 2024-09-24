import { Injectable } from '@angular/core';
import { OrderReviewStateModel, ReviewerModel } from '../../../../../core/services/order-review/order-review.model';

@Injectable({
    providedIn: 'root',
})
export class OrderReviewAssignmentTransformer {
    transform(state: OrderReviewStateModel, reviewers: ReviewerModel[]): OrderReviewStateModel {
        return {
            ...state,
            reviewers: reviewers ?? [],
        };
    }
}
