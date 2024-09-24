import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, catchError, combineLatest, of, switchMap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';

@Component({
    selector: 'app-confirm-create-raw-project',
    templateUrl: './confirm-create-raw-project.component.html',
})
export class ConfirmCreateRawProjectComponent implements OnInit {
    isSpinner = false;
    confirmMessage: Message[] = [];
    flatLanguageArray = [];
    mappedLangArray = [];
    mapped_language;
    language_id;
    langObjectArray = [];
    newProjectID;
    versionID;
    projectDetailsSub: Subscription;
    projectDetails: any;
    constructor(
        private projectService: ProjectService,
        private resourceService: ResourceService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private ref: DynamicDialogRef,
        private messageService: MessageService,
        private layoutService: DashboardLayoutService,
        private eventBus: NgEventBus,
        private readonly projectPropertiesService: ProjectPropertiesService
    ) {}

    ngOnInit(): void {
        this.projectDetailsSub = this.projectService.propertiesState.subscribe((response) => {
            this.projectDetails = response;
        });
        this.confirmMessage = [
            {
                severity: 'warn',
                summary: 'Confirmation',
                detail: 'Please confirm all the properties you have entered for project creation is right. ',
            },
        ];
    }

    prevPage() {
        this.projectPropertiesService.setState(5);
    }

    showConfirm() {
        this.confirmationService.confirm({
            message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            header: 'Cancel Project',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.projectService.closeCreateDialog();
                this.router.navigate(['main/dashboard']);
            },
            reject: () => {
                this.confirmMessage = [
                    {
                        severity: 'info',
                        summary: 'Rejected',
                        detail: 'You have rejected',
                    },
                ];
            },
        });
    }

    createProject() {
        this.isSpinner = true;
        const formData = this.projectService.getProjectCreatePayload(this.projectDetails);
        const form_data = this.convertToFormData(formData);

        const defaultProjectFields: any = {
            projectName: formData.title,
            finalDelivery: formData.due_date,
            date: new Date(),
        };
        this.eventBus.cast(
            'onProjectCreate:AddRow',
            this.layoutService.setRowChildProject(defaultProjectFields, '00', 'Default')
        );
        this.projectService
            .createProject(form_data)
            .pipe(
                catchError((error) => of(error)),
                switchMap((res) => {
                    return combineLatest([
                        this.handleCreateProjectResponse(res),
                        this.handleScreenshotUploadResponse(res),
                    ]);
                })
            )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .subscribe(([_createProjectResponse, screenshotUploadResponse]) => {
                if (screenshotUploadResponse?.['status'] === ResponseStatusEnum.OK) {
                    this.resourceService.setResourceState({
                        data: this.projectDetails.resourceUploadData,
                        isScreenshotUploadInProgress: false,
                        isScreenshotReportDownloadButtonVisible: true,
                    });
                    this.projectDetails.isRawProject = false;
                }
            });
    }

    setParentNull(arr) {
        for (const node of arr) {
            node.parent = null;
            if (node?.['children']) {
                this.setParentNull(node.children);
            }
        }
    }

    ngOnDestroy() {
        this.projectDetailsSub.unsubscribe();
    }

    convertTreeArrayToFlatArray(arg, parentId, parentName) {
        const flatLang = [];
        arg.map((lang) => {
            lang.parent_language_id = parentId;
            lang.parent_language_name = parentName;
            this.flatLanguageArray.push(lang);
            if (lang?.['children']) {
                this.convertTreeArrayToFlatArray(lang.children, lang.language_id, lang.language_name);
            }
        });

        return flatLang;
    }

    private convertToFormData(formData): FormData {
        const form_data = new FormData();
        for (const key in formData) {
            form_data.append(key, formData[key]);
        }
        return form_data;
    }

    private getManagerId() {
        return this.projectDetails.selectedManager?.id !== undefined ? this.projectDetails.selectedManager.id : 0;
    }

    private getManagerEmail() {
        return this.projectDetails.selectedManager?.email != undefined ? this.projectDetails.selectedManager.email : '';
    }
    private handleCreateProjectResponse(response: ApiBaseResponseModel) {
        if (response) {
            if (response.status === ResponseStatusEnum.OK) {
                this.isSpinner = false;
                this.newProjectID = response.data[0].project_id;
                this.versionID = response.data[0].version_no;
                const metaData = this.buildMetaDataFormData();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                this.closeDialog();

                return this.projectService.uploadMetaData(metaData).pipe(catchError(() => of(undefined)));
            }
        }

        return of(undefined);
    }

    handleScreenshotUploadResponse(res) {
        if (res && this.projectDetails.resourceUploadData?.file) {
            this.resourceService.setResourceState({
                data: this.projectDetails.resourceUploadData,
                isScreenshotUploadInProgress: true,
                isScreenshotReportDownloadButtonVisible: false,
            });
            return this.resourceService.uploadFile(
                `screenshot/project/${this.newProjectID}/screenshots`,
                this.projectDetails.resourceUploadData
            );
        }

        return of(undefined);
    }

    private buildMetaDataFormData(): FormData {
        const metaData = new FormData();
        metaData.append('project_id', this.newProjectID);
        metaData.append('version_no', this.versionID);
        metaData.append('length_calculation_id', this.projectDetails?.lengthCalculationsOfVectorFonts?.id);
        metaData.append('font_id', this.projectDetails?.defaultFontPackages?.id);
        return metaData;
    }

    closeDialog() {
        this.ref.close();
    }
}
