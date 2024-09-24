import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ReviewerDashboardTransformer } from 'src/app/components/dashboard/reviewer-dashboard/reviewer-dashboard.transformer';
import { RequestModel } from 'src/app/shared/components/grid/grid.model';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class ReviewerService {
    private reviewState = new BehaviorSubject<RequestModel>(null);

    constructor(
        private api: ApiService,
        private userService: UserService,
        private httpClient: HttpClient,
        private transformer: ReviewerDashboardTransformer
    ) {}

    getReviewRequests(request) {
        const requestPayload = {
            ...request,
            userId: this.userService.getUser().id,
        };
        return this.api
            .postTypeRequest('review', requestPayload)
            .pipe(map((response) => this.transformer.transform(response)));
    }

    // TODO: Shift this method to a utility static class
    private isResponseOk(response) {
        return response['status']?.toLowerCase() === ResponseStatusEnum.OK.toLowerCase();
    }

    updateReviewRequestStatus(data) {
        return this.api
            .patchTypeRequest('review/update-order-status', data)
            .pipe(filter((response) => this.isResponseOk(response)));
    }

    finishReviewRequest(data) {
        return this.api.patchTypeRequest('review/finish-order', data);
    }

    setRequestData(data: RequestModel) {
        this.reviewState.next(data);
    }
    getRequestData() {
        return this.reviewState.asObservable();
    }
}
