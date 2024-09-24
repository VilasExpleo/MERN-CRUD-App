import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { catchError, of } from 'rxjs';
import { OrderReviewService } from 'src/app/core/services/order-review/order-review.service';
import {
    OrderReviewStateModel,
    initializeOrderReviewState,
} from '../../../../../core/services/order-review/order-review.model';

@Component({
    selector: 'app-order-review-statistics',
    templateUrl: './statistics.component.html',
})
export class OrderReviewStatisticsComponent implements OnInit {
    model: OrderReviewStateModel = initializeOrderReviewState;
    minimumDate = new Date();
    isStatisticsLoading = false;
    isReviewOrderRequestLoading = false;

    @Input()
    statisticsHeaderText = 'Select a due date and finalize your order';

    @Output()
    navigationEvent = new EventEmitter<number>();

    @Output()
    closeDialog = new EventEmitter<boolean>();

    constructor(private orderReviewService: OrderReviewService, private eventBus: NgEventBus) {}

    ngOnInit(): void {
        this.isStatisticsLoading = true;
        this.orderReviewService
            .getOrderReviewStatisticsState()
            .pipe(catchError(() => of(initializeOrderReviewState)))
            .subscribe((response) => {
                this.isStatisticsLoading = false;
                this.model = response;
            });
    }

    navigate(index: number) {
        this.orderReviewService.setOrderReviewState(this.model);
        this.navigationEvent.next(index);
    }

    createReviewOrder() {
        this.isReviewOrderRequestLoading = true;
        this.orderReviewService.setOrderReviewState(this.model);
        this.orderReviewService
            .createReviewOrder()
            .pipe(catchError(() => of(false)))
            .subscribe((response) => {
                this.isReviewOrderRequestLoading = false;
                this.closeDialog.emit(!!response);
                //Todo When the backend data is ready,the review order update it in the dashboard
                !!response && this.eventBus.cast('newReviewOrder:newReviewOrder', '');
            });
    }

    getLoadingClass() {
        if (this.isStatisticsLoading) {
            return 'flex justify-content-center';
        }

        if (this.isReviewOrderRequestLoading) {
            return 'spinner';
        }

        return '';
    }
}
