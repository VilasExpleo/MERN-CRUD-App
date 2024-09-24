import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, iif, map, of, switchMap, take } from 'rxjs';
import { OrderReviewAssignmentTransformer } from 'src/app/components/dashboard/order-review/components/assignment/assignment.transformer';
import { OrderReviewLanguageTransformer } from 'src/app/components/dashboard/order-review/components/language/language.transformer';
import { OrderReviewStatisticsTransformer } from 'src/app/components/dashboard/order-review/components/statistics/statistics.transformer';
import {
    OrderReviewStateModel,
    ReviewerLanguageModel,
    ViewTypeOption,
} from 'src/app/core/services/order-review/order-review.model';
import { OrderReviewSaveRequestModel } from 'src/app/shared/models/order-review/order-review-save-api.model';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ReviewTypeEnum } from 'src/app/components/dashboard/order-review/components/language/review-type.enum';
@Injectable({
    providedIn: 'root',
})
export class OrderReviewService {
    private orderReviewState = new BehaviorSubject<OrderReviewStateModel>(null);
    orderReviewState$ = this.orderReviewState.asObservable();

    constructor(
        private apiService: ApiService,
        private userService: UserService,
        private orderReviewLanguageTransformer: OrderReviewLanguageTransformer,
        private orderReviewAssignmentTransformer: OrderReviewAssignmentTransformer,
        private orderReviewStatisticsTransformer: OrderReviewStatisticsTransformer
    ) {}

    setOrderReviewState(state: OrderReviewStateModel) {
        this.orderReviewState.next(state);
    }

    getOrderReviewState(): Observable<OrderReviewStateModel> {
        return this.orderReviewState$;
    }

    getOrderReviewLanguageState() {
        const state$ = this.getOrderReviewState();
        const reviewTypes$ = this.transformReviewTypes();
        return combineLatest([state$, reviewTypes$]).pipe(
            take(1),
            map(([state, reviewTypes]) => this.orderReviewLanguageTransformer.transform(state, reviewTypes))
        );
    }

    getOrderReviewAssignmentState() {
        const state$ = this.getOrderReviewState();
        const reviewers$ = this.getReviewers();

        return combineLatest([state$, reviewers$]).pipe(
            take(1),
            map(([state, reviewers]) => this.orderReviewAssignmentTransformer.transform(state, reviewers))
        );
    }

    getOrderReviewStatisticsState() {
        const state$ = this.getOrderReviewState();
        const statistics$ = this.getOrderReviewState().pipe(
            take(1),
            switchMap((state: OrderReviewStateModel) => {
                const payload = {
                    projectId: state.projectId,
                    reviewType: state?.selectedReviewType?.value,
                    languages: state.targetLanguages
                        .map((targetLanguage: ReviewerLanguageModel) => targetLanguage.languageCode)
                        .toString(),
                };

                return this.apiService.postTypeRequest('review/text-node-statistics', payload).pipe(
                    catchError(() => of(undefined)),
                    map((response) => response?.['data'])
                );
            })
        );

        return combineLatest([state$, statistics$]).pipe(
            map(([state, statistics]) => this.orderReviewStatisticsTransformer.transform(state, statistics))
        );
    }

    createReviewOrder() {
        return this.getOrderReviewState().pipe(
            take(1),
            switchMap((state: OrderReviewStateModel) => {
                const payload = this.getReviewOrderPayload(state);
                return this.apiService
                    .postTypeRequest('review/order-review', payload)
                    .pipe(
                        switchMap((response) =>
                            iif(
                                () => state.selectedFiles?.length > 0,
                                this.uploadDocuments(state, response['data'].requestId),
                                of(EMPTY)
                            )
                        )
                    );
            })
        );
    }

    private uploadDocuments(state: OrderReviewStateModel, requestId: string) {
        const payload = this.createFormPayload(state, requestId);
        return this.apiService.postTypeRequest('review/aws/upload', payload);
    }

    private getReviewers() {
        const payload = { brand: this.userService.getUser().brand_name };
        return this.apiService.postTypeRequest('translation-member-data/reviewers', payload).pipe(
            map((response) => response['data']),
            catchError(() => of([]))
        );
    }

    private getReviewOrderPayload(state): OrderReviewSaveRequestModel {
        const selectedLanguages = [];
        const reviewAssignments = [];

        state.targetLanguages.forEach((languages) => {
            selectedLanguages.push({ languageCode: languages.languageCode, languageId: languages.languageId });
            reviewAssignments.push({
                languageId: languages.languageId,
                reviewerId: languages.reviewer['id'],
                reviewerEmail: languages.reviewer['email'],
            });
        });

        return {
            projectId: state.projectId,
            versionId: state.versionId,
            selectedLanguages,
            reviewAssignments,
            sourceId: state.selectedLanguage.languageId,
            sourceLanguage: state.selectedLanguage.languageCode,
            dueDate: this.convertDateFormat(state.dueDate),
            editorId: this.userService.getUser().id,
            reviewType: state?.selectedReviewType?.value,
        };
    }

    private convertDateFormat(date: Date) {
        const due_date = new Date(date),
            month = ('0' + (date.getMonth() + 1)).slice(-2),
            day = ('0' + date.getDate()).slice(-2);
        return [due_date.getFullYear(), month, day].join('-');
    }

    private createFormPayload(state: OrderReviewStateModel, requestId: string) {
        const formData = new FormData();

        formData.append('projectId', state.projectId.toString());
        formData.append('versionId', state.versionId);
        formData.append('editorId', this.userService.getUser().id);
        formData.append('reviewRequestId', requestId);

        state?.selectedFiles?.forEach((file) => {
            formData.append('data', file);
        });

        return formData;
    }

    getReviewTypes(): Observable<string[]> {
        return this.getOrderReviewState().pipe(
            switchMap((response: OrderReviewStateModel) => {
                const projectID = response?.projectId;
                const url = `review/project/${projectID}/available-review-types`;
                return this.apiService.getRequest(url).pipe(
                    catchError(() => of(null)),
                    map((reviewTypeResponse: ApiBaseResponseModel) => {
                        if (reviewTypeResponse?.status === ResponseStatusEnum.OK) {
                            return reviewTypeResponse?.['data'] || [];
                        }
                        return [];
                    })
                );
            })
        );
    }

    transformReviewTypes(): Observable<ViewTypeOption[]> {
        return this.getReviewTypes().pipe(
            map((response: string[]) => {
                return response.map((value: string) => ({
                    label: ReviewTypeEnum[value],
                    value,
                }));
            })
        );
    }
}
