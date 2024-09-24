import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ManageRawProjectService } from 'src/app/core/services/data-creator/manage-raw-project.service';
import { UseCaseEnum } from 'src/app/shared/enums/use-case.enum';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AssignEditorRequestModel } from 'src/app/shared/models/data-creator/assign-editor-request.model';
import { RawProjectService } from '../../../../core/services/data-creator/raw-project.service';
import { HmiMessageService } from '../../../../core/services/toast/hmi-message.service';
import { GridHeaderModel } from '../../../../shared/components/grid/grid.model';
import { CreateRawProjectComponent } from '../create-raw-project-dialog/create-raw-project.component';
import {
    ManageRawProjectModel,
    ManageRawProjectStateModel,
} from '../create-raw-project-dialog/manage-raw-project-state.model';
import { AssignEditorComponent } from './assign-editor/assign-editor.component';
import { RawProjectGridModel } from './raw-project-grid.model';

@Component({
    selector: 'app-raw-project-grid',
    templateUrl: './raw-project-grid.component.html',
    styleUrls: ['../../dashboard.component.scss'],
})
export class RawProjectGridComponent implements OnInit {
    @Output() loadingChange: EventEmitter<boolean> = new EventEmitter(true);
    contextMenuItems: MenuItem[] = [];
    viewPageLine = 10;
    rawProjects: RawProjectGridModel[] = [];
    selectedRawProject: RawProjectGridModel;
    model: ManageRawProjectStateModel = this.manageRawProjectService.getInitialState();
    columns: GridHeaderModel[] = [];

    projectDeleteConfirmationModel = {
        showConfirmation: false,
        confirmationHeader: 'Warning',
        confirmationMessage: '',
        onAccept: () => {
            this.closeProjectDeleteDialog();
        },
        onReject: () => {
            this.projectDeleteConfirmationModel.showConfirmation = false;
        },
    };

    constructor(
        private router: Router,
        private dialogService: DialogService,
        private hmiMessageService: HmiMessageService,
        private manageRawProjectService: ManageRawProjectService,
        private dataCreatorService: RawProjectService,
        private eventBus: NgEventBus
    ) {}

    ngOnInit(): void {
        this.onLoad();
    }

    private setLoading(value: boolean) {
        this.loadingChange.emit(value);
    }

    private onLoad() {
        this.setLoading(true);
        this.dataCreatorService
            .getRawProjects()
            .pipe(catchError(() => of(undefined)))
            .subscribe((rawProjects) => {
                this.setLoading(false);
                if (rawProjects) {
                    this.rawProjects = rawProjects;
                    this.selectedRawProject = rawProjects[0];
                    this.eventBus.cast('rawProjectRequest:totalCount', this.rawProjects.length);
                }
            });
        this.initializeTableColumns();
    }

    private initializeTableColumns() {
        this.columns = [
            {
                field: 'name',
                header: 'Project',
                sort: true,
                filter: { type: 'text' },
            },
            {
                field: 'version',
                header: 'Version',
                sort: true,
                filter: { type: 'numeric' },
            },
            {
                field: 'languageCount',
                header: 'No. of Languages',
                sort: true,
                filter: { type: 'numeric' },
            },
            {
                field: 'editorName',
                header: 'Assigned to',
                sort: true,
                filter: { type: 'text' },
            },
        ];
    }

    getRawProjectDetails() {
        this.displayContextMenu();
    }

    displayContextMenu() {
        this.contextMenuItems = [
            {
                label: 'Properties',
                icon: 'pi pi-cog',
                command: () => {
                    this.editProjectPropertiesDialog();
                },
            },
            {
                label: 'Edit Project',
                icon: 'pi pi-pencil',
                command: () => {
                    this.showEditTextnodes();
                },
            },
            {
                label: 'Assign',
                icon: 'pi pi-user',
                command: () => {
                    this.showAssignProjectDialog();
                },

                disabled: !!this.selectedRawProject.editorName,
            },
            {
                label: 'Send Update',
                icon: 'pi pi-sync',
                command: () => {
                    this.showSendProjectUpdateDialog();
                },

                disabled: !this.selectedRawProject.editorName,
            },
            {
                separator: true,
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => {
                    this.showDeleteProjectConfirmation();
                },
            },
        ];
    }

    showCreateRawProjectDialog(dialogTitle: string) {
        const ref = this.dialogService.open(CreateRawProjectComponent, this.getDefaultDialogConfig(dialogTitle));

        ref.onClose.subscribe(() => {
            this.onLoad();
        });
    }

    private getDefaultDialogConfig(header: string, data?) {
        return {
            header,
            footer: ' ',
            modal: true,
            closable: true,
            autoZIndex: true,
            maximizable: false,
            width: '70vw',
            minX: 10,
            minY: 10,
            data: data,
            draggable: true,
        };
    }
    createRawProjectDialog() {
        this.manageRawProjectService.setManageRawProjectModel(this.manageRawProjectService.getInitialState());
        this.showCreateRawProjectDialog(CreateRawProjectComponent.title);
    }
    editProjectPropertiesDialog() {
        this.dataCreatorService
            .getProjectProperties(this.selectedRawProject.id)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ManageRawProjectModel) => {
                this.model.rawProject = response;
                this.model.useCase = UseCaseEnum.Edit;
                this.manageRawProjectService.setManageRawProjectModel(this.model);
                this.showCreateRawProjectDialog(`Properties of ${this.selectedRawProject.name}`);
            });
    }

    showEditTextnodes() {
        this.router.navigate(['main', 'raw-project-textnodes', this.selectedRawProject.id]);
    }

    showAssignProjectDialog() {
        this.dialogService.open(AssignEditorComponent, {
            header: 'Assign to Editor',
            width: '30%',
            height: '30%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: false,
            data: this.selectedRawProject,
        });
    }

    showSendProjectUpdateDialog() {
        const payload: AssignEditorRequestModel = {
            editorId: this.selectedRawProject.editorId,
        };
        this.dataCreatorService
            .sendToUpdate(payload, this.selectedRawProject?.id)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.hmiMessageService.showSuccess({
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    this.hmiMessageService.showError({
                        summary: 'Failed',
                        detail: response.message,
                    });
                }
            });
    }

    showDeleteProjectConfirmation() {
        if (this.selectedRawProject.editorId) {
            this.projectDeleteConfirmationModel.confirmationMessage =
                "Deleting the project will lead to a loss of the connection between this project template and the instance of the project assigned to the editor. You won't be able to provide any project updates for this project past this point. Are you sure you want to proceed?";
        } else {
            this.projectDeleteConfirmationModel.confirmationMessage =
                'Are you sure that you want to delete the project?';
        }
        this.projectDeleteConfirmationModel.showConfirmation = true;
    }

    private closeProjectDeleteDialog() {
        this.projectDeleteConfirmationModel.showConfirmation = false;
        this.setLoading(true);
        this.dataCreatorService
            .deleteRawProject(this.selectedRawProject.id)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: boolean) => {
                this.setLoading(false);
                this.hmiMessageService.handleResponseOnDialogClose(
                    !!response,
                    'Project',
                    'Project deleted successfully',
                    'Failed to delete Project'
                );

                if (response) {
                    const index = this.rawProjects.findIndex((el) => el.id === this.selectedRawProject.id);
                    this.rawProjects.splice(index, 1);
                    this.eventBus.cast('rawProjectRequest:totalCount', this.rawProjects.length);
                }
            });
    }
}
