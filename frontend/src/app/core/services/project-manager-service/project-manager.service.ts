import { Injectable } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { Observable, Subject, catchError, of } from 'rxjs';
import { ResponseStatusEnum, TranslationRequestsStatusEnum } from 'src/Enumerations';
import { RejectOrderRequestModel } from 'src/app/shared/models/reject-order/reject-order.request.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ProjectManagerTR } from '../../../shared/models/translation-request/pm-translation-request';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectManagerService {
    private assignTranslationManagerSubject = new Subject<any>();
    constructor(
        private readonly api: ApiService,
        private readonly messageService: MessageService,
        private readonly eventBus: NgEventBus
    ) {}
    getList(url) {
        return this.api.getTypeRequest(url, '');
    }
    getTemplateList(postData) {
        return this.api.postTypeRequest('translation-member-data/layout-data', postData);
    }
    saveData(postData) {
        return this.api.patchTypeRequest('translation-member-data/assign_translation_manager', postData);
    }
    saveTemplateData(postData) {
        return this.api.postTypeRequest('translation-member-data/save_layout', postData);
    }
    updateTemplateData(postData) {
        return this.api.patchTypeRequest('translation-member-data/update_layout', postData);
    }
    deleteTemplateData(postData) {
        return this.api.deleteTypeRequest('translation-member-data/remove_layout', postData);
    }
    openAssignTransalationManagerAssignDialog(projectdata: ProjectManagerTR) {
        this.assignTranslationManagerSubject.next(projectdata);
    }

    clearAssignTransalationManagerAssignDialog() {
        this.assignTranslationManagerSubject.next('');
    }

    getAssignTransalationManagerAssignDialog(): Observable<any> {
        return this.assignTranslationManagerSubject.asObservable();
    }

    rejectOrder(project, comment): void {
        const url = `project-manager-dashboard/reject-order`;
        const payload: RejectOrderRequestModel = {
            translationRequestId: project?.id,
            projectId: project?.projectId,
            status: TranslationRequestsStatusEnum.Rejected,
            reason: comment,
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
                    this.eventBus.cast('projectManager:rejectResponse', response);
                }
            });
    }
}
