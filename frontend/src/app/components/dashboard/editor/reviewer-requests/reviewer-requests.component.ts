import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { ReviewerRequestsService } from 'src/app/core/services/editor/reviewer-requests.service';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ReviewerRequestsModel, initializeReviewerRequests } from './reviewer-requests.model';
@Component({
    selector: 'app-reviewer-requests',
    templateUrl: './reviewer-requests.component.html',
})
export class ReviewerRequestsComponent implements OnInit {
    isLoading = false;
    model: ReviewerRequestsModel = initializeReviewerRequests;
    destroyed$ = new Subject<boolean>();

    constructor(
        private dashboardLayoutService: DashboardLayoutService,
        private reviewerRequestsService: ReviewerRequestsService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.onLoad();
        //Todo Backend data done then only row update automatically on the dashboard
        this.eventBus
            .on('newReviewOrder:newReviewOrder')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.onLoad();
                },
            });
    }

    private onLoad() {
        this.isLoading = true;
        this.reviewerRequestsService
            .getReviewRequests(this.getRequestPayload())
            .pipe(catchError(() => of(initializeReviewerRequests)))
            .subscribe((response) => {
                this.isLoading = false;
                this.model = response;
                this.dashboardLayoutService.setCountToReviewOrders(response?.grid?.requests?.length ?? 0);
                this.eventBus.cast('reviewOrders:totalCount', response);
            });
    }

    private getRequestPayload() {
        return {
            end: 0,
            start: 0,
        };
    }
}
