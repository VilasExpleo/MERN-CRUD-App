import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, catchError, combineLatest, map, of, switchMap, take } from 'rxjs';
import { AddReportTransformer } from 'src/app/components/Reports/project-report/add-report/add-report.transformer';
import { ProjectReportModel } from 'src/app/components/Reports/project-report/generate-report/generate-report.model';
import { GenerateReportsTransformer } from 'src/app/components/Reports/project-report/generate-report/generate-report.transformer';
import { ProjectReportComponent } from 'src/app/components/Reports/project-report/project-report.component';
import { ReportPreviewModel } from 'src/app/components/Reports/project-report/report-preview/report-preview.model';
import { PreviewReportTransformer } from 'src/app/components/Reports/project-report/report-preview/report-preview.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AddReportRequestModel } from 'src/app/shared/models/reports/add-report-request.model';
import { DeleteReportRequestModel } from 'src/app/shared/models/reports/delete-report-request.model';
import { DuplicateReportNameRequestModel } from 'src/app/shared/models/reports/duplicate-report-name-request.model';
import {
    DownloadReportModel,
    GenerateReportResponseModel,
} from 'src/app/shared/models/reports/generate-report-reponse.model';
import { GenerateReportRequestModel } from 'src/app/shared/models/reports/generate-report.request.model';
import { ProjectReportRequestModel } from 'src/app/shared/models/reports/project-report-request.model';
import { ReportFormatResponseModel } from 'src/app/shared/models/reports/report-format.response.model';
import { ReportData } from 'src/app/shared/models/reports/report.data';
import { RoleResponseModel } from 'src/app/shared/models/reports/role-response.model';
import { ApiService } from '../api.service';
import { User } from 'src/app/shared/models/user';

@Injectable({
    providedIn: 'root',
})
export class ProjectReportService {
    constructor(
        private apiService: ApiService,
        private generateReportsTransformer: GenerateReportsTransformer,
        private addReportTransformer: AddReportTransformer,
        private dialogService: DialogService,
        private messageService: MessageService,
        private previewReportTransformer: PreviewReportTransformer
    ) {}

    validateDuplicateReportName(payload: DuplicateReportNameRequestModel) {
        return this.apiService.postTypeRequest('report/create/validate-name', payload);
    }

    getProjectReports(payload: ProjectReportRequestModel): Observable<ProjectReportModel[]> {
        return this.apiService
            .postTypeRequest('report/list', payload)
            .pipe(map((response) => this.generateReportsTransformer.transform(response)));
    }

    deleteProjectReport(reportId: number) {
        const payload: DeleteReportRequestModel = {
            reportId: reportId,
        };
        return this.apiService.postTypeRequest(`report/delete`, payload);
    }

    upload(payload: FormData) {
        return this.apiService.postTypeRequest('report/create/upload', payload).pipe(
            map((response: ApiBaseResponseModel) => ({
                fileData: response?.['data']?.fileData,
                fileName: response?.['data']?.fileName,
            }))
        );
    }

    addReport(payload: AddReportRequestModel) {
        return this.apiService.postTypeRequest('report/create', payload);
    }

    getFormOptions() {
        const roles$: Observable<RoleResponseModel[]> = this.apiService
            .getRequest('report/create/role-list')
            .pipe(map((response: ApiBaseResponseModel) => response?.data));

        const formats$: Observable<ReportFormatResponseModel[]> = this.apiService
            .getRequest('report/create/format-list')
            .pipe(map((response: ApiBaseResponseModel) => response?.data));

        return combineLatest([roles$, formats$]).pipe(
            take(1),
            map(([roles, formats]) => this.addReportTransformer.transform(roles, formats))
        );
    }

    showProjectReport(projectDetails?: any) {
        const projectReportDialogRef = this.dialogService.open(
            ProjectReportComponent,
            this.getDialogDefaultConfig(projectDetails)
        );

        projectReportDialogRef.onMaximize.subscribe((value) => {
            this.messageService.add({
                severity: 'info',
                summary: 'Maximized',
                detail: `maximized: ${value.maximized}`,
            });
        });
    }

    getDialogDefaultConfig(projectDetails?: any) {
        return {
            footer: ' ',
            modal: true,
            closable: true,
            autoZIndex: true,
            maximizable: false,
            width: '80vw',
            minX: 10,
            minY: 10,
            draggable: true,
            data: this.getReportData(projectDetails),
            header: 'Reports',
        };
    }

    getReportData(projectDetails?: any): ReportData {
        return {
            generateReportTitle: `Select the report you wish to create from the list below. You can view a preview of the selected report to see how
    the result will look like.`,
            pageSource: 'dashboard',
            projectDetails: projectDetails,
        };
    }

    downloadReport(file, fileName): void {
        const url = window.URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }

    downloadReportTemplateXSD(url, fileName): void {
        this.apiService
            .downloadRequest(url)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) {
                    this.downloadReport(response, fileName);
                }
            });
    }

    generateReport(reportData: ProjectReportModel, projectDetails: any, user: User): Observable<DownloadReportModel> {
        return this.generateSelectedReport(reportData, projectDetails, user).pipe(
            catchError(() => of(undefined)),
            switchMap((response) => {
                if (response['data']?.reportFile) {
                    const generateReport: GenerateReportResponseModel = {
                        reportFile: response['data']?.reportFile,
                    };
                    const url = `common/download?fileKey=${generateReport.reportFile}`;
                    const fileName =
                        generateReport.reportFile.split('/')[generateReport.reportFile.split('/').length - 1];
                    return this.apiService.downloadRequest(url).pipe(
                        map((res): DownloadReportModel => {
                            return { fileName, file: res };
                        })
                    );
                }
                return of(undefined);
            })
        );
    }

    private generateSelectedReport(
        reportData: ProjectReportModel,
        projectDetails: any,
        user: User
    ): Observable<ApiBaseResponseModel> {
        return this.apiService.postTypeRequest(
            'report/generate',
            this.getGenerateReportPayload(reportData, projectDetails, user)
        );
    }

    getPreview(reportData: ProjectReportModel, projectDetails: any, user: User): Observable<ReportPreviewModel> {
        return this.apiService
            .postTypeRequest('report/preview', this.getGenerateReportPayload(reportData, projectDetails, user))
            .pipe(map((response: ApiBaseResponseModel) => this.previewReportTransformer.transform(response.data)));
    }

    getGenerateReportPayload(
        reportData: ProjectReportModel,
        projectDetails: any,
        user: User
    ): GenerateReportRequestModel {
        return {
            reportId: reportData.id,
            projectId: projectDetails.project_id ?? projectDetails.projectId,
            creatorId: user.id,
        };
    }
}
