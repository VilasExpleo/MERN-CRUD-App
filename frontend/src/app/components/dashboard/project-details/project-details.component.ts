import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ProjectStatusEnum } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { UploadRequestModel } from 'src/app/shared/models/resource/resource-file-upload-request.model';
import { UtcToLocalTimePipe } from 'src/app/shared/pipes/datePipe/utc-to-local-time.pipe';
@Component({
    selector: 'app-project-details',
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
    loadingViewDetails = false;
    viewSelectedProject: any = [];
    editorLanguage: string;
    progressStatus;
    viewDetails = false;
    tzNames: string;
    forViewStatusOkOrUpdateAvailable = false;
    forViewStatusScheduled = false;
    showAcceptRejectBtn = true;
    displayProjectDeatils = false;
    projectProgressDetails;
    selectedPid: number;
    progressbar = {};
    messages: string[] = [];
    yesCount;
    completedLangStatusCount;
    statusAvg;
    projectTitle;
    versionData = 0;
    recalculateStatus;
    projectProgressValue;
    showConfirmation = false;
    confirmationMessage: string;
    confirmationHeader: string;
    resourceUploadData: UploadRequestModel;
    resourceState;
    isScreenshotProgressVisible = false;

    @Output() abortOperation: EventEmitter<any> = new EventEmitter();
    screenshotUploadStatus: Message[];
    constructor(
        private eventBus: NgEventBus,
        public projectService: ProjectService,
        private utcToLocalTimePipe: UtcToLocalTimePipe,
        private resourceService: ResourceService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('showDetails:showDetails').subscribe((data: any) => {
            this.progressbar = {};
            this.setProjectDetails(data._data);
        });
        this.eventBus.on('prgressbar:prgressbar').subscribe((data: any) => {
            this.progressbar = {};
            this.progressbar = data._data;
        });
        this.eventBus.on('showdetails:showdetails').subscribe((data: any) => {
            this.viewDetails = data._data;
        });

        this.isScreenshotProgressVisible = this.isScreenshotInProgress();

        this.resourceService.getResourceState().subscribe((response) => {
            this.getResourceStateData(response);
        });
    }

    private getResourceStateData(response) {
        if (response) {
            if (response?.isScreenshotUploadInProgress) {
                this.isScreenshotProgressVisible = true;
            } else {
                this.isScreenshotProgressVisible = false;
            }
            this.resourceUploadData = response?.data;
        }
    }

    setProjectDetails(data) {
        if (data !== undefined) {
            this.editorLanguage = data?.editorLanguage;
            this.showProjectDetails(
                data.pid,
                data.title,
                data.progress,
                data.data,
                data.version,
                data.status,
                data.projData
            );
        }
    }
    showProjectDetails(pid, title, progress, _data, version, status, projData) {
        this.selectedPid = pid;
        this.viewSelectedProject = projData?.[0];
        this.editorLanguage = this.viewSelectedProject?.editor_language_code;
        let yesCount = 0;
        let completedLangStatusCount = 0;
        let statusAvg = 0;
        if (this.viewSelectedProject?.status != undefined && this.viewSelectedProject?.status == 'OK') {
            this.viewSelectedProject?.language_prop.map((item) => {
                if (item.status === 100) completedLangStatusCount++;
                if (item.translation_request === 'Yes') yesCount++;
                statusAvg = item.status + statusAvg;
            });
            this.progressStatus = this.viewSelectedProject?.editor_language_status;
            this.yesCount = yesCount;
            this.completedLangStatusCount = completedLangStatusCount;
            this.statusAvg = statusAvg / this.viewSelectedProject?.language_prop.length;
        }
        if (this.viewSelectedProject?.schedule_datetime != undefined) {
            this.tzNames = this.utcToLocalTimePipe.transform(this.viewSelectedProject?.schedule_datetime);
        }
        this.loadingViewDetails = true;
        this.selectedPid = pid;
        this.projectTitle = title;
        this.versionData = version;
        this.projectProgressValue = progress;
        this.recalculateStatus = status;
        this.viewDetails = projData?.length === 1;
        this.forViewStatusOkOrUpdateAvailable =
            status === ProjectStatusEnum.OK || status === ProjectStatusEnum.UpdateAvailable;
        this.forViewStatusScheduled = status === 'scheduled';

        if (progress !== 100) {
            this.showAcceptRejectBtn = false;
        }
        this.displayProjectDeatils = true;
        this.projectProgressDetails = { project_id: pid };

        if (status != 'scheduled' && status != 'OK' && projData.length != 0) {
            this.projectService
                .getProjectProgressDetails('project-create/progress-detail', this.projectProgressDetails)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res: any) => {
                    if (res?.data) {
                        this.messages = [];
                        this.progressbar = {};
                        for (let i = 0; i < res.data?.length; i++) {
                            if (pid == res.data[i]?.projectid) {
                                this.progressbar[pid + 'id'] = res.data[i].projectid;
                                this.progressbar[pid + 'progress'] = res.data[i].progress;
                                this.progressbar[pid + 'report'] = res.data[i].report;
                                this.progressbar[pid] = res.data[i];
                                this.messages.push(res.data[i].message);
                            }
                        }
                        this.viewDetails = true;
                    }
                    this.loadingViewDetails = false;
                });
        } else {
            this.loadingViewDetails = false;
        }
    }

    abortOperationData(id) {
        this.abortOperation.emit(id);
    }
    getProjectStatusInfo(response) {
        return {
            fonts: this.getExistingMessageOfFont(response),
            lengthCalculation: this.getExistingMessageOfLc(response),
        };
    }

    private getExistingMessageOfLc(response) {
        const existingMessageOfLc = [];

        const lcNames = response.filter((projectDetails) => projectDetails.Lc_availability).map((item) => item.Lc_name);

        const uniqueLc = lcNames.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});

        Object.entries(uniqueLc).forEach((lc) => {
            existingMessageOfLc.push({ name: lc[0], count: lc[1] });
        });

        return existingMessageOfLc;
    }

    private getExistingMessageOfFont(response) {
        const existingMessageOfFont = [];

        const lcFonts = response
            .filter((projectDetails) => projectDetails.font_availability)
            .map((item) => item.font_name);

        const uniqueFont = lcFonts.reduce(function (prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
        }, {});

        Object.entries(uniqueFont).forEach((font) => {
            const fontDetails = response.find((projectDetails) => projectDetails.font_name === font[0]);
            existingMessageOfFont.push({ name: font[0], count: font[1], fontDetails: fontDetails });
        });

        return existingMessageOfFont;
    }

    getProjectErrorStatusInfo(response) {
        const res = response.map((item) => item.message);
        return Array.from(new Set(res));
    }

    getErrorsCount(response) {
        if (response) {
            return response?.reduce((totalCount, nextError) => totalCount + nextError.count, 0);
        }
    }
    isProgressCompleted(): boolean {
        return this.progressbar[this.selectedPid + 'progress'] === 100;
    }

    isScreenshotInProgress() {
        return this.viewSelectedProject?.['screenshotUploadInProgress'] === 1;
    }

    displayAbortConfirmPopup() {
        this.showConfirmation = true;
        this.confirmationMessage = `You are about to cancel the upload. As a result, the existing screenshot version will not be updated. Are you sure you want to proceed?`;
        this.confirmationHeader = `Resource`;
    }

    abortFileUpload() {
        this.resourceService
            .abortFileUpload(`screenshot/project/${this.selectedPid}/screenshots`, this.resourceUploadData)
            .subscribe({
                next: (response) => {
                    if (response['status'] === 'NOK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response['message'],
                        });
                        this.isScreenshotProgressVisible = false;
                        this.resourceService.setResourceState({
                            isScreenshotReportDownloadButtonVisible: false,
                        });
                        this.showConfirmation = false;
                    }
                },
            });
    }

    onAccept() {
        this.abortFileUpload();
    }
    onReject() {
        this.showConfirmation = false;
    }
}
