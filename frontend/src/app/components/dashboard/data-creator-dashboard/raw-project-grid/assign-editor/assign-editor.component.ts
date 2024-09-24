import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { RawProjectService } from 'src/app/core/services/data-creator/raw-project.service';
import { HmiMessageService } from 'src/app/core/services/toast/hmi-message.service';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AssignEditorRequestModel } from 'src/app/shared/models/data-creator/assign-editor-request.model';
import { RawProjectGridModel } from '../raw-project-grid.model';

@Component({
    selector: 'app-assign-editor',
    templateUrl: './assign-editor.component.html',
})
export class AssignEditorComponent implements OnInit {
    editors: AssignUserModel[] = [];
    buttonLabel = 'Assign';
    private selectedProject: RawProjectGridModel;

    constructor(
        private dataCreatorService: RawProjectService,
        private readonly dialogRef: DynamicDialogRef,
        private readonly dynamicDialogConfig: DynamicDialogConfig,
        private readonly hmiMessageService: HmiMessageService
    ) {}

    ngOnInit(): void {
        this.getEditors();
        this.selectedProject = this.dynamicDialogConfig?.data;
    }

    getEditors() {
        this.editors = [];
        this.dataCreatorService
            .getEditors()
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: AssignUserModel[]) => {
                if (response) {
                    this.editors = response;
                }
            });
    }

    assignToEditor(user: AssignUserModel) {
        const payload: AssignEditorRequestModel = {
            editorId: user.id,
        };
        this.dataCreatorService
            .assign(payload, this.selectedProject?.id)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.hmiMessageService.showSuccess({
                        summary: 'Success',
                        detail: response.message,
                    });

                    this.selectedProject.editorId = user.id;
                    this.selectedProject.editorName = user.name;
                    this.dialogRef?.close();
                } else {
                    this.hmiMessageService.showError({
                        summary: 'Failed',
                        detail: response.message,
                    });
                }
            });
    }
}
