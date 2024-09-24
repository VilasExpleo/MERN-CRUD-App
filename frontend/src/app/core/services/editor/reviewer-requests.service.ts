import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { ReviewerRequestsTransformer } from 'src/app/components/dashboard/editor/reviewer-requests/reviewer-requests.transformer';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class ReviewerRequestsService {
    constructor(
        private api: ApiService,
        private userService: UserService,
        private transformer: ReviewerRequestsTransformer
    ) {}

    getReviewRequests(request) {
        const requestPayload = {
            ...request,
            userId: this.userService.getUser().id,
            role: Roles[this.userService.getUser().role],
        };
        return this.api
            .postTypeRequest('review/request-details', requestPayload)
            .pipe(map((response) => this.transformer.transform(response)));
    }
}
