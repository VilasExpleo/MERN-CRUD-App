import { Injectable } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum, Roles, TranslationRequestsStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { RejectOrderRequestModel } from 'src/app/shared/models/reject-order/reject-order.request.model';
import { ApiService } from '../api.service';
import { IUserModel } from '../user/user.model';
import { ProofreadLanguageRow } from 'src/app/components/dashboard/proofreader-dashboard/proofreader.model';

@Injectable({
    providedIn: 'root',
})
export class RejectOrderService {
    constructor(
        private readonly api: ApiService,
        private readonly messageService: MessageService,
        private readonly eventBus: NgEventBus
    ) {}

    rejectOrder(project, comment: string, user?: IUserModel, childRow?: ProofreadLanguageRow): void {
        const TMLanguage = project?.language_prop?.[0]?.language_id;
        const url = `translation-request/reject-order`;
        const payload: RejectOrderRequestModel = {
            translationRequestId: project?.translation_request_id || project?.translationRequestId,
            projectId: project?.project_id || project?.projectId,
            status: TranslationRequestsStatusEnum.Rejected,
            reason: comment,
            userId: user?.id,
            userRole: Roles[user?.role],
            languageId: TMLanguage || project?.language_id || childRow?.targetLanguage?.id,
        };

        this.api
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    this.eventBus.cast('rejectOrder:rejectResponse', response);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed',
                        detail: response.message,
                    });
                }
            });
    }
}
