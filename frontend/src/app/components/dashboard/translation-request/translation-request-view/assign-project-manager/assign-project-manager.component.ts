import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { TranslationImportService } from 'src/app/core/services/translation-import/translation-import.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AssignPMRequestModel } from './assign-project-manager.request.model';

@Component({
    selector: 'app-assign-project-manager',
    templateUrl: './assign-project-manager.component.html',
})
export class AssignProjectManagerComponent implements OnInit {
    users: AssignUserModel[];
    description;
    brand: string;
    translationOrder;
    buttonLabel = 'Order Translation Request';
    selectedProjectId: number;
    constructor(
        private readonly userService: UserService,
        private readonly translationRequestService: TranslationRequestService,
        private readonly translationImportService: TranslationImportService,
        private readonly messageService: MessageService,
        private readonly dialogRef: DynamicDialogRef
    ) {}

    ngOnInit(): void {
        this.translationOrder = this.translationImportService.getTranslationOrderParameters();

        this.getManagers();
    }

    private getManagers(): void {
        const url = `translation-member-data/project-manager-list`;
        this.brand = this.userService.getUser().brand_name.trim();
        this.translationRequestService
            .getManager(url, { brand: this.brand })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: ApiBaseResponseModel) => {
                if (res.status === ResponseStatusEnum.OK) {
                    this.users = res['data'];
                }
            });
    }

    public assignManager(user: AssignUserModel): void {
        const url = `translation-request/reassign-project-manager`;
        const payload: AssignPMRequestModel = {
            translationRequestId: this.translationOrder?.id,
            projectId: this.translationOrder?.project_id,
            projectManagerId: user?.id,
            projectManagerEmail: user?.email,
        };
        this.translationRequestService
            .saveReassignedProjectManager(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.dialogRef?.close(response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    this.messageService.add({
                        severity: 'Error',
                        summary: 'Failed',
                        detail: response.message,
                    });
                }
            });
    }
}
