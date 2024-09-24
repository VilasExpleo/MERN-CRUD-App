import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { Subscription, catchError, of } from 'rxjs';
import { Roles, TranslationRoleEnum, UsersRoles } from 'src/Enumerations';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { GrammarParserConfigurationService } from 'src/app/core/services/resource/grammar-parser-configuration.service';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { DeleteResourceRequestModel } from 'src/app/shared/models/resource/delete-resource-file-request.model';
import { GrammarParserDetailsResponseModel } from 'src/app/shared/models/grammar-parser/grammar-parser-details-response.model';
import { UploadRequestModel } from 'src/app/shared/models/resource/resource-file-upload-request.model';
import { UserModel } from 'src/app/shared/models/user/user.model';
import { LcAndFontModel } from '../../components/resources/lc-and-fonts/lc-and-fonts.model';
import {
    ParserConfigurationDetailsModel,
    ParserConfigModel,
} from '../../components/resources/parser-config/parser-config-item/parser-config.model';
import { FileState } from '../../components/resources/screenshots/screenshots.model';
@Component({
    selector: 'app-metadata',
    templateUrl: './metadata.component.html',
    styleUrls: ['./metadata.component.scss'],
    providers: [ConfirmationService],
})
export class MetadataComponent implements OnInit, OnDestroy {
    isScreenshotsFileSelected = false;
    isDirectoriesOfConfigurationFileSelected = false;
    isMiscellaneousDocumentsFileSelected = false;
    screenshotsFile: File;
    directoriesOfConfigurationFile: File;
    miscellaneousDocumentsFile: File;
    metadataOfProjectForm: UntypedFormGroup;
    fontOption: any = [];
    state;
    lcOption: any = [];
    submitBtn = false;
    role = [];
    selectedRole = [];
    metadataValueChangeSubscriber: Subscription;
    selectedLC;
    selectedFont;
    showConfirmation = false;
    projectName: string;
    currentUserInformation: UserModel;
    projectID: number;
    resourceSubscription: Subscription;
    formChangesSubscription: Subscription;
    deleteFileSubscription: Subscription;
    isFileChanged = false;
    isProjectPropertiesChanged = false;
    isLoading = false;
    @ViewChild('fileUpload', { static: false })
    fileUpload: FileUpload;
    isTypeDeleteConfirmation = false;
    confirmationMessage: string;
    confirmationHeader: string;
    clearIcon: string;
    chooseLabel = `Choose`;
    chooseIcon = `pi pi-plus`;
    clearStyleClass = `p-button-primary`;
    resourceState = {};
    isMetaFormFieldChanged = false;
    isRawProject = false;
    parseConfigurationsSubscription: Subscription;
    parseConfigurations: ParserConfigurationDetailsModel[] = [];
    parserConfigModel: ParserConfigModel;
    grammarParserIds: number[];
    constructor(
        private readonly config: DynamicDialogConfig,
        private readonly projectPropertiesService: ProjectPropertiesService,
        private readonly fb: UntypedFormBuilder,
        private readonly projectService: ProjectService,
        private readonly messageService: MessageService,
        private readonly fileUploadService: FileUploadService,
        private readonly ref: DynamicDialogRef,
        private readonly resourceService: ResourceService,
        private readonly userService: UserService,
        private readonly eventBus: NgEventBus,
        private readonly parserConfigurationService: GrammarParserConfigurationService
    ) {}

    ngOnInit(): void {
        this.parserConfigModel = this.parserConfigurationService.getCreateParseConfiguration();
        if (this.parserConfigModel) {
            this.projectService.setParseConfigurationState({
                parseConfigurationDetailsModel: [
                    this.parserConfigModel.speechCommands.editor,
                    this.parserConfigModel.speechCommands.translator,
                    this.parserConfigModel.speechPrompts.editor,
                    this.parserConfigModel.speechPrompts.translator,
                ],
            });
        }
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.isLoading = true;
        this.currentUserInformation = this.userService.getUser();
        this.getParserConfiguration();
        this.getProjectProperties();
        this.isScreenshotsFileSelected = this.isScreenshotUploaded();
        this.projectName = this.state?.projectData?.properties[0]?.title;
        this.getResourceState();
        this.getLcAndFontState();
        this.getDeleteResourceState();
    }

    ngOnDestroy(): void {
        if (this.metadataValueChangeSubscriber) {
            this.metadataValueChangeSubscriber.unsubscribe();
        }
        if (this.resourceSubscription) {
            this.resourceSubscription.unsubscribe();
        }
        if (this.parseConfigurationsSubscription) {
            this.parseConfigurationsSubscription.unsubscribe();
        }
        this.deleteFileSubscription?.unsubscribe();
    }

    downloadProjectMetadata() {
        this.projectPropertiesService
            .downloadMetadata({ project_id: this.config?.data?.project_id })
            .pipe(catchError(() => of(undefined)))
            .subscribe();
    }

    hideContent(fileType) {
        switch (fileType) {
            case 'Resource': {
                this.isScreenshotsFileSelected = false;
                break;
            }
            case 'DirectoriesOfConfiguration': {
                this.isDirectoriesOfConfigurationFileSelected = false;
                break;
            }
            default: {
                this.isMiscellaneousDocumentsFileSelected = false;
                break;
            }
        }
    }

    onConfigurationFilesSelected(event: any) {
        this.directoriesOfConfigurationFile = event.files[0];
    }
    onMiscellaneousDocumentsSelected(event: any) {
        this.miscellaneousDocumentsFile = event.files[0];
    }

    uploadMultipleFiles() {
        const formData = new FormData();
        if (this.screenshotsFile) {
            formData.append('metadata[]', this.screenshotsFile, this.screenshotsFile.name);
        }
        if (this.directoriesOfConfigurationFile) {
            formData.append(
                'metadata[]',
                this.directoriesOfConfigurationFile,
                this.directoriesOfConfigurationFile.name
            );
        }
        if (this.miscellaneousDocumentsFile) {
            formData.append('metadata[]', this.miscellaneousDocumentsFile, this.miscellaneousDocumentsFile.name);
        }
        formData.append('project_id', this.config?.data?.project_id);
        formData.append('version_no', this.config?.data?.version_no);
        this.projectPropertiesService
            .updateMetadata(formData)
            .pipe(catchError(() => of(undefined)))
            .subscribe();
    }

    closePropertiesDialogOnCancel() {
        if (!this.submitBtn) {
            this.confirmationMessage = `Are you sure you want to cancel?`;
            this.confirmationHeader = `Cancel Properties`;
            this.showConfirmation = true;
            this.resetStates();
        } else {
            this.ref.close();
        }
    }

    submitProjectMetadata() {
        if (this.isMetaFormFieldChanged) {
            this.confirmationMessage = `You are about to make changes to metadata of the project,
            that will lead to a mass operation and recalculation of all project texts.`;
            this.confirmationHeader = `Warning`;
            this.showConfirmation = true;
            this.isProjectPropertiesChanged = true;
        } else if (this.isFileChanged) {
            this.uploadScreenshotsFile();
        } else {
            this.ref.close();
        }
    }

    handleUpdateProperties() {
        const updateRowOnDashboard = {
            title: this.state.properties?.project_properties?.title,
            date: this.state.properties?.project_properties?.due_date,
            version_no: this.state.properties?.project_properties?.version_no,
        };
        this.eventBus.cast('onProjectPropertiesChanges:editorLanguageChanges', updateRowOnDashboard);
        this.ref.close();
        this.state.properties.gpConfigIds = this.grammarParserIds;
        this.projectPropertiesService
            .updateProjectProperties(this.state.properties)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.submitBtn = true;
                    this.state.isProjectPropertiesUpdated = 1;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project properties updated successfully',
                    });
                    if (this.isFileChanged) {
                        this.uploadScreenshotsFile();
                    }
                    this.projectService.setPropertiesState(this.state);
                }
            });
    }

    uploadScreenshotsFile() {
        const resourceUploadData: UploadRequestModel = {
            file: this.screenshotsFile,
            userRole: Roles[this.currentUserInformation.role],
        };

        if (this.isUploadInProgress()) {
            this.resourceService
                .abortFileUpload(`screenshot/project/${this.projectID}/screenshots`, resourceUploadData)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response) => {
                    if (response['status'] === 'NOK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response['message'],
                        });
                        this.resourceService.setResourceState({
                            isScreenshotReportDownloadButtonVisible: false,
                        });
                        this.state.projectData.screenshotUploadInProgress = 0;
                    }
                });
        } else {
            this.ref.close();
            this.state.projectData.screenshotUploadInProgress = 1;
            this.resourceService.setResourceState({
                data: resourceUploadData,
                isScreenshotUploadInProgress: true,
                isScreenshotReportDownloadButtonVisible: false,
            });
            this.resourceService
                .uploadFile(`screenshot/project/${this.projectID}/screenshots`, resourceUploadData)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response) => {
                    if (response['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response['message'],
                        });
                        this.resetStates();
                        this.state.projectData.screenshotUploadInProgress = 0;
                        this.resourceService.setResourceState({
                            data: resourceUploadData,
                            isScreenshotUploadInProgress: false,
                            isScreenshotReportDownloadButtonVisible: true,
                        });
                    }
                });
        }
    }

    abortFileUpload() {
        if (this.isUploadInProgress()) {
            this.confirmationMessage = `You are about to cancel the upload. As a result, the existing screenshot version will not be updated. Are you sure you want to proceed?`;
            this.confirmationHeader = `Resource`;
            this.showConfirmation = true;
        }
        this.clearIcon = `pi pi-times`;
        this.chooseIcon = `pi pi-plus`;
        this.chooseLabel = `Choose`;
    }

    displayConfirmation() {
        if (this.isScreenshotsFileSelected) {
            this.confirmationMessage = `You are about to delete the file. As a result, the existing screenshot version will be deleted. Are you sure you want to proceed?`;
            this.confirmationHeader = `Resource`;
            this.isTypeDeleteConfirmation = true;
        }
        if (this.isUploadInProgress()) {
            this.confirmationMessage = `You are about to cancel the upload. As a result, the existing screenshot version will not be updated. Are you sure you want to proceed?`;
            this.confirmationHeader = `Resource`;
        }

        this.showConfirmation = true;
    }

    private resetStates() {
        this.resourceService.setResourceState(null);
        const screenShotState: FileState = {
            screenshotUploadState: 2,
            screenShotFile: null,
        };
        this.projectService.setScreenShotState(screenShotState);
        this.resourceService.setDeleteResourceState(false);
        this.state.projectData.screenshotUploadInProgress = 2;
        this.isScreenshotsFileSelected = false;
        this.screenshotsFile = null;
        this.submitBtn = true;
    }

    isScreenshotUploaded(): boolean {
        return this.state?.projectData?.screenshotUploadInProgress === 0;
    }

    isUploadInProgress(): boolean {
        return this.state?.projectData?.screenshotUploadInProgress === 1;
    }

    handleDeleteResponse() {
        this.isLoading = true;
        const deleteResourceData: DeleteResourceRequestModel = {
            userRole: Roles[this.currentUserInformation.role],
        };
        const deleteURL = `project/${this.projectID}/screenshots`;
        this.resourceService
            .deleteResource(deleteURL, deleteResourceData)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                this.isLoading = false;
                if (response['status'] === 'OK') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Delete',
                        detail: response['message'],
                    });
                    this.resourceService.setResourceState({
                        isScreenshotReportDownloadButtonVisible: false,
                    });
                    this.resetStates();
                }
            });
    }

    onAccept() {
        if (this.isProjectPropertiesChanged) {
            this.handleUpdateProperties();
        } else if (this.isTypeDeleteConfirmation) {
            this.handleDeleteResponse();
        } else if (this.isUploadInProgress()) {
            this.uploadScreenshotsFile();
        } else {
            this.ref.close();
        }
    }

    onReject() {
        this.showConfirmation = false;
        this.resourceService.setDeleteResourceState(false);
    }

    nextTab(): void {
        this.projectPropertiesService.setState(5);
    }

    prevTab(): void {
        this.projectPropertiesService.setState(3);
    }

    private getProjectProperties(): void {
        this.projectService.getPropertiesState().subscribe((res) => {
            this.state = res;
            this.isRawProject = this.projectPropertiesService.projectType === 'raw';
            this.screenshotsFile = new File([], `${this.state?.projectData?.properties[0]?.title} screenshots.zip`);
            const fontId: number = this.state?.projectData?.lc_and_font[0]?.font_id;
            const lcIds: number[] = this.state?.projectData?.lc_and_font[0]?.lengthCalculationIds ?? [];
            this.projectID = this.state?.projectData?.properties[0]?.project_id;
            const lcFontState: LcAndFontModel = {
                translationRole: this.isRawProject
                    ? TranslationRoleEnum.Constrained
                    : this.state.projectData?.['properties'][0]?.['translation_role'],
                defaultLengthCalculationsOfVectorFonts: lcIds,
                defaultFontPackages: fontId,
            };
            this.projectService.setLcAndFontState(lcFontState);

            const screenShotState: FileState = {
                screenshotUploadState: this.state?.projectData?.screenshotUploadInProgress,
                screenShotFile: this.screenshotsFile,
            };
            this.projectService.setScreenShotState(screenShotState);
            this.setParserConfigState(res);
        });
    }

    private getResourceState(): void {
        this.resourceSubscription = this.resourceService
            .getResourceState()
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (state) => {
                    if (state?.data) {
                        this.screenshotsFile = state?.data.file;
                        this.isScreenshotsFileSelected = true;
                        this.submitBtn = false;
                        this.isFileChanged = true;
                    }
                },
            });
    }

    private getLcAndFontState(): void {
        this.metadataValueChangeSubscriber = this.projectService.getLcAndFontState().subscribe((response) => {
            if (response) {
                this.isMetaFormFieldChanged = response?.formChange;
                this.state.properties.project_metadata = {
                    lengthCalculationIds: response.defaultLengthCalculationsOfVectorFonts,
                    font_id: response.defaultFontPackages,
                };
                this.state.properties.project_properties = {
                    ...this.state.properties.project_properties,
                    translation_role: response.translationRole,
                };
                this.submitBtn =
                    (!response.defaultLengthCalculationsOfVectorFonts.length || !response.defaultFontPackages) &&
                    response.translationRole === TranslationRoleEnum.Constrained;
            }
        });
    }

    private getDeleteResourceState(): void {
        this.deleteFileSubscription = this.resourceService.getDeleteResourceState().subscribe((response: boolean) => {
            response && this.displayConfirmation();
        });
    }

    private setParserConfigState(res): void {
        res.projectData?.gpDetails.forEach((parserDetails: GrammarParserDetailsResponseModel) => {
            this.parseConfigurations.map((item) => {
                if (
                    item.title === UsersRoles[parserDetails.configRole] &&
                    item.standardType === parserDetails.fileType
                ) {
                    item.gpConfigId = parserDetails.id;
                    item.fileName = parserDetails.fileName;
                }
                return item;
            });

            this.projectService.setParseConfigurationState({
                parseConfigurationDetailsModel: this.parseConfigurations,
                formChange: true,
            });
        });
    }

    private getParserConfiguration() {
        this.parseConfigurationsSubscription = this.projectService
            .getParseConfigurationState()
            .subscribe((response) => {
                if (response) {
                    if (response.formChange) {
                        this.grammarParserIds = response.parseConfigurationDetailsModel
                            ?.filter((configId) => configId.gpConfigId)
                            .map((config) => config.gpConfigId);
                        this.isMetaFormFieldChanged = true;
                    }
                    this.parseConfigurations = response.parseConfigurationDetailsModel;
                }
            });
    }
}
