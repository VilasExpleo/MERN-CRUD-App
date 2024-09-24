import { Component, Input, OnInit } from '@angular/core';
import { ProjectStatusEnum, TranslationImportStatusEnum } from 'src/Enumerations';
import { ReportService } from 'src/app/core/services/reports/report.service';
import { TranslationImportReportService } from 'src/app/core/services/reports/translation-import-report.service';
import { WorkbookService } from 'src/app/core/services/reports/workbook.service';
import { DashboardComponent } from '../../editor/dashboard.component';
import { ResourceService } from 'src/app/core/services/resource/resource.service';
import { DownloadFileService } from 'src/app/core/services/download/download-file.service';
@Component({
    selector: 'app-project-creation-report',
    templateUrl: './project-creation-report.component.html',
    styleUrls: ['./project-creation-report.component.scss'],
})
export class ProjectCreationReportComponent implements OnInit {
    downloadReportName;
    reportData;
    reportProjectuuId;
    reportDaraArr = [];
    errorDataArr = [];
    reportDataJson1;
    successDataJson = [];
    completeReport = [];
    warningDataJson = [];
    recalculateJson = [];
    loading = false;
    projectUpdateReport;
    newTextnodelength;
    @Input() xlsxdownloadId: number;
    @Input() prgressbar: [];
    @Input() selectedProduct;
    @Input() projectTitle;
    @Input() versionData;
    @Input() recalculateStatus;
    showHideButtons = true;
    hideButtons = false;
    mappingReportDataJson;
    mappingAssistantResponse;
    changeTextNodeWarningData;
    changeTextNodeSuccessData;
    changeTextNodeErrorData;
    TranslationImportStatusEnum = TranslationImportStatusEnum;
    @Input() status;
    constructor(
        public reportService: ReportService,
        private dashboardComponent: DashboardComponent,
        private translationImportReportService: TranslationImportReportService,
        public workbookService: WorkbookService,
        private resourceService: ResourceService,
        private downloadFileService: DownloadFileService
    ) {}

    ngOnInit(): void {
        this.reportService.isDisabledBtn = true;
        if (
            this.recalculateStatus === ProjectStatusEnum.OK ||
            this.recalculateStatus === ProjectStatusEnum.UpdateAvailable
        ) {
            this.hideButtons = true;
            this.showHideButtons = false;
        }
        this.resourceService.getResourceState().subscribe((response) => {
            this.getResourceStateData(response);
        });
    }

    private getResourceStateData(response) {
        if (response) {
            if (response?.isScreenshotReportDownloadButtonVisible) {
                this.selectedProduct['screenshotUploadInProgress'] = 0;
            } else {
                this.selectedProduct['screenshotUploadInProgress'] = 1;
            }
        }
    }

    addSingle(xlsxdownloadId) {
        this.dashboardComponent.addSingle(xlsxdownloadId);
    }

    showConfirmDelete(xlsxdownloadId) {
        this.dashboardComponent.showConfirmDelete(xlsxdownloadId);
    }

    downloadReport() {
        if (
            this.status?.toLowerCase() === TranslationImportStatusEnum.TranslationImport ||
            this.selectedProduct?.version_name?.toLocaleLowerCase().startsWith('import')
        ) {
            this.translationImportReportService.getTranslationImportReport(this.xlsxdownloadId).subscribe();
        } else {
            this.reportService.saveReport(
                this.status,
                this.selectedProduct,
                this.xlsxdownloadId,
                this.recalculateStatus
            );
        }
    }

    isScreenshotUploaded(): boolean {
        return this.selectedProduct?.['screenshotUploadInProgress'] === 0 && this.selectedProduct?.isRawProject;
    }

    downloadScreenshotReport() {
        this.resourceService
            .downloadScreenshotReport(this.selectedProduct?.project_id)
            .subscribe(({ downloadResponse, fileName }) => {
                if (downloadResponse) {
                    this.downloadFileService.downloadFile(downloadResponse, fileName);
                }
            });
    }
}
