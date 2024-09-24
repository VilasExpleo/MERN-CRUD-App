import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ProjectManagerService } from 'src/app/core/services/project-manager-service/project-manager.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AssignTMRequestModel } from './assign-translation-manager.request.model';

@Component({
    selector: 'app-reassign-translation-manager',
    templateUrl: './reassign-translation-manager.component.html',
})
export class ReassignTranslationManagerComponent implements OnInit {
    buttonLabel = 'Order Translation Request';
    translationManagerList: AssignUserModel[] = [];
    constructor(
        private readonly projectManagerService: ProjectManagerService,
        private readonly config: DynamicDialogConfig,
        private readonly translationRequestService: TranslationRequestService,
        private readonly messageService: MessageService,
        private readonly dialogRef: DynamicDialogRef
    ) {}

    ngOnInit(): void {
        this.getTranslationManagersList();
    }

    private getTranslationManagersList() {
        this.projectManagerService
            .getList('translation-member-data/translation-manager-list')
            .subscribe((res) => (this.translationManagerList = res['status'] === 'OK' ? res['data'] : []));
    }

    assignTranslationManager(user: AssignUserModel): void {
        const url = `translation-request/reassign-translation-manager`;
        const payload: AssignTMRequestModel = {
            translationRequestId: this.config.data?.translationRequestId,
            projectId: this.config.data?.projectId,
            translationManagerId: user?.id,
            translationManagerEmail: user?.email,
            languageId: this.config.data?.languageId,
        };
        this.translationRequestService
            .saveReassignedTranslationManager(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.dialogRef?.close({ response, user });
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
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
