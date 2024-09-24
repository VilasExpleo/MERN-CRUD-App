import { Component, OnInit } from '@angular/core';
import { IgcDockManagerLayout } from '@infragistics/igniteui-dockmanager';
import { catchError, of } from 'rxjs';
import { TextNodeStatus } from 'src/Enumerations';
import { ReviewerService } from 'src/app/core/services/reviewer/reviewer.service';
import { ReviewerDashboardRequestModel } from 'src/app/shared/models/reviewer/reviewer-api.model';
import { DashboardLayoutService } from '../../../core/services/layoutConfiguration/dashboard-layout.service';
import { RequestModel } from '../../../shared/components/grid/grid.model';
import { UserService } from './../../../core/services/user/user.service';
import { TargetLanguageRequestModel } from './../../../shared/components/grid/grid.model';
import { ReviewerDashboardModel, initializeReviewerDashboard } from './reviewer-dashboard.model';

@Component({
    selector: 'app-reviewer-dashboard',
    templateUrl: './reviewer-dashboard.component.html',
})
export class ReviewerDashboardComponent implements OnInit {
    isLoading = false;
    layout: IgcDockManagerLayout;
    contentId: 'review';
    model = initializeReviewerDashboard;
    selectedReviewRequest: RequestModel;
    showFinishOrderDialog: boolean;
    targetLanguageRequest: TargetLanguageRequestModel;

    constructor(
        private layoutService: DashboardLayoutService,
        private reviewerService: ReviewerService,
        private user: UserService
    ) {}

    ngOnInit(): void {
        this.onLoad();
    }

    selectReviewRequest(request: RequestModel) {
        this.selectedReviewRequest = request;
    }

    private onLoad() {
        this.isLoading = true;
        this.reviewerService
            .getReviewRequests(this.getRequestPayload())
            .pipe(catchError(() => of(initializeReviewerDashboard)))
            .subscribe((response: ReviewerDashboardModel) => {
                this.isLoading = false;
                this.model = response;
                this.selectedReviewRequest = response.grid.requests[0];
                this.layoutService.proofreaderOrdersCount(response.grid.requests.length);
                this.layout = this.layoutService.getDefaultLayout(this.contentId);
            });
    }

    private getRequestPayload(): Partial<ReviewerDashboardRequestModel> {
        return {
            end: 0,
            start: 0,
        };
    }

    finishReviewRequest() {
        const requestPayload = {
            userId: this.user.getUser().id,
            requestId: this.selectedReviewRequest.id,
            status: TextNodeStatus.Closed,
            languageCode: this.targetLanguageRequest.targetLanguageCode,
        };

        this.reviewerService
            .finishReviewRequest(requestPayload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) {
                    this.targetLanguageRequest.returnDate = new Date();
                }
            });
        this.showFinishOrderDialog = false;
    }

    showFinishReviewOrderDialog(targetLanguageRequest: TargetLanguageRequestModel) {
        this.targetLanguageRequest = targetLanguageRequest;
        this.showFinishOrderDialog = true;
    }

    closeFinishOrderDialog() {
        this.showFinishOrderDialog = false;
    }

    uploadDocuments(count: number) {
        this.selectedReviewRequest.documentCount = count;
    }
}
