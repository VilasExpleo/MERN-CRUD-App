import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ManageRawProjectService } from '../../../../core/services/data-creator/manage-raw-project.service';
import { RawProjectService } from '../../../../core/services/data-creator/raw-project.service';
import { UseCaseEnum } from '../../../../shared/enums/use-case.enum';
import { ManageRawProjectStateModel } from './manage-raw-project-state.model';

@Component({
    selector: 'app-create-raw-project',
    templateUrl: './create-raw-project.component.html',
})
export class CreateRawProjectComponent implements OnInit, OnDestroy {
    unsubscribe$: Subject<boolean> = new Subject();
    static readonly title = 'Project Creation';
    steps: MenuItem[] = [];
    activeIndex = 0;
    isLoading = false;
    UseCase = UseCaseEnum;
    model: ManageRawProjectStateModel;

    showConfirmation = false;
    projectCreateCancelConfirmationModel = {
        showConfirmation: false,
        confirmationHeader: 'Warning',
        confirmationMessage: 'Are you sure you want to cancel the project creation?',
        onAccept: () => {
            this.closeDialog();
        },
        onReject: () => {
            this.projectCreateCancelConfirmationModel.showConfirmation = false;
        },
    };

    constructor(
        private dynamicDialogRef: DynamicDialogRef,
        public dynamicDialogConfig: DynamicDialogConfig,
        private rawProjectService: RawProjectService,
        private messageService: MessageService,
        private manageRawProjectService: ManageRawProjectService
    ) {}

    ngOnInit(): void {
        this.steps = this.getSteps();
        this.manageRawProjectService.getManageRawProjectModel().subscribe((model) => (this.model = model));
    }

    ngOnDestroy() {
        this.unsubscribe$.next(true);
        this.unsubscribe$.complete();
    }

    navigate(index: number) {
        this.activeIndex = index;
    }

    private getSteps(): MenuItem[] {
        return [
            {
                label: 'Project Details',
                command: () => {
                    this.activeIndex = 0;
                },
            },
            {
                label: 'Language Settings',
                command: () => {
                    this.activeIndex = 1;
                },
            },
            {
                label: 'Verification',
                command: () => {
                    this.activeIndex = 2;
                },
            },
        ];
    }

    beforeCloseDialog(showConfirmationDialog: boolean) {
        if (this.model.useCase === UseCaseEnum.Create && showConfirmationDialog) {
            this.showCreateProjectCancelConfirmation();
        } else {
            this.closeDialog();
        }
    }

    closeDialog() {
        this.dynamicDialogRef.close();
    }

    loadingOnChange(value: boolean) {
        this.isLoading = value;
    }

    private showCreateProjectCancelConfirmation() {
        this.projectCreateCancelConfirmationModel.showConfirmation = true;
    }
    updateProjectDetails() {
        this.rawProjectService
            .updateRawProject(this.model.rawProject)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project Update successfully',
                    });
                    this.closeDialog();
                }
            });
    }
}
