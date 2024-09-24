import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { TranslationManagerService } from 'src/app/core/services/translation-manager-service/translation-manager.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { IUserModel } from 'src/app/core/services/user/user.model';
import { UserService } from 'src/app/core/services/user/user.service';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ReassignWorkerRequestModel } from './reassign-translator.request.model';

@Component({
    selector: 'app-translator-worker',
    templateUrl: './reassign-translator.component.html',
})
export class ReassignWorkerComponent implements OnInit {
    buttonLabel = 'Order Translation Request';
    translatorsList: AssignUserModel[] = [];
    userInfo: IUserModel;
    constructor(
        private readonly translationService: TranslationManagerService,
        private readonly config: DynamicDialogConfig,
        private readonly translationRequestService: TranslationRequestService,
        private readonly messageService: MessageService,
        private readonly dialogRef: DynamicDialogRef,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.userInfo = this.userService.getUser();
        this.getTranslatorsList();
    }

    private getTranslatorsList(): void {
        this.translationService
            .getList('translation-member-data/translator-list', {
                translation_manager_id: this.userInfo.id,
            })
            .subscribe(
                (res: ApiBaseResponseModel) =>
                    (this.translatorsList = res.status === ResponseStatusEnum.OK ? res.data : [])
            );
    }

    reassignTranslator(user: AssignUserModel): void {
        const url = `translation-request/reassign-translator`;
        const payload: ReassignWorkerRequestModel = {
            translationRequestId: this.config.data?.selectedProject?.translation_request_id,
            projectId: this.config.data?.selectedProject?.project_id,
            translatorId: user?.id,
            translatorEmail: user?.email,
            languageId: this.config.data?.childRow?.language_id,
        };
        this.translationRequestService
            .saveReassignedTranslator(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response) {
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
                }
            });
    }
}
