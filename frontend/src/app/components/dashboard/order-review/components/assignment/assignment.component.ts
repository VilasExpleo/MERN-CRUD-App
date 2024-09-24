import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    OrderReviewStateModel,
    ReviewerLanguageModel,
    initializeOrderReviewState,
} from '../../../../../core/services/order-review/order-review.model';
import { OrderReviewService } from '../../../../../core/services/order-review/order-review.service';

@Component({
    selector: 'app-order-review-assignment',
    templateUrl: './assignment.component.html',
})
export class OrderReviewAssignmentComponent implements OnInit {
    model: OrderReviewStateModel = initializeOrderReviewState;
    isLoading = true;

    @Input()
    assignReviewerText = 'Assign reviewer';

    @Input()
    assignLanguagesText = 'Project Languages';

    @Input()
    reviewerText = 'Reviewer';

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(private orderReviewService: OrderReviewService) {}

    ngOnInit(): void {
        this.orderReviewService.getOrderReviewAssignmentState().subscribe({
            next: (response: OrderReviewStateModel) => {
                this.isLoading = false;
                this.model = response;
            },
        });
    }

    navigate(index: number) {
        this.orderReviewService.setOrderReviewState({
            ...this.model,
        });
        this.navigationEvent.next(index);
    }

    isAnyReviewerAssigned(targetLanguages: ReviewerLanguageModel[]) {
        return targetLanguages.find((targetLanguage: ReviewerLanguageModel) => !!targetLanguage.reviewer?.id);
    }
}
