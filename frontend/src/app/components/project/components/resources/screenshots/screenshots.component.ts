import { Component, OnDestroy, OnInit } from '@angular/core';
import { Roles } from 'src/Enumerations';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { UserModel } from 'src/app/shared/models/user/user.model';
import { FileState, FileUploadModel, ResourceModel } from './screenshots.model';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-screenshots',
    templateUrl: './screenshots.component.html',
})
export class ScreenshotsComponent implements OnInit, OnDestroy {
    screenshotsFile: File;
    isScreenshotsFileSelected = false;
    fileUploaded = false;
    fileUploadInProgress = false;
    resourceSubscription: Subscription;
    currentUserInformation: UserModel;
    uploadSettings = {
        chooseLabel: `Choose`,
        chooseIcon: `pi pi-plus`,
        clearStyleClass: `p-button-primary`,
        clearIcon: `pi pi-times`,
    };

    constructor(
        private readonly fileUploadService: FileUploadService,
        private readonly projectService: ProjectService,
        private readonly userService: UserService,
        private readonly resourceService: ResourceService
    ) {}

    ngOnInit(): void {
        this.currentUserInformation = this.userService.getUser();
        this.resourceSubscription = this.projectService.getScreenShotState().subscribe((state: FileState) => {
            if (state) {
                this.fileUploaded = state.screenshotUploadState === 0;
                this.fileUploadInProgress = state.screenshotUploadState === 1;
                this.screenshotsFile = state.screenShotFile;
                this.setIconsIfUploadInProgress();
                this.setIconsIfScreenshotIsUploaded();
            }
        });
    }

    ngOnDestroy(): void {
        this.resourceSubscription?.unsubscribe();
    }

    onScreenshotsSelected(event: any) {
        this.screenshotsFile = event.files[0];
        this.fileUploaded = false;
        const resourceUploadData: FileUploadModel = {
            file: this.screenshotsFile,
            userRole: Roles[this.currentUserInformation.role],
        };

        const resourceState: ResourceModel = {
            data: resourceUploadData,
        };
        this.resourceService.setResourceState(resourceState);
    }

    removeScreenshotsFile() {
        this.isScreenshotsFileSelected = false;
        this.screenshotsFile = null;
    }

    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }

    showConfirmation() {
        this.resourceService.setDeleteResourceState(true);
    }

    private setIconsIfUploadInProgress() {
        if (this.fileUploadInProgress) {
            this.resetIcon();
        }
    }

    private setIconsIfScreenshotIsUploaded() {
        if (this.fileUploaded) {
            this.uploadSettings.clearIcon = `pi pi-trash`;
            this.uploadSettings.chooseIcon = `pi pi-sync`;
            this.uploadSettings.chooseLabel = `Replace`;
            this.uploadSettings.clearStyleClass = `p-button-danger`;
            this.resourceService.setResourceState({
                isScreenshotReportDownloadButtonVisible: true,
            });
        } else {
            this.resetIcon();
            this.resourceService.setResourceState({
                isScreenshotReportDownloadButtonVisible: false,
            });
        }
    }

    private resetIcon() {
        this.uploadSettings.clearIcon = `pi pi-times`;
        this.uploadSettings.chooseIcon = `pi pi-plus`;
        this.uploadSettings.chooseLabel = `Choose`;
    }
}
