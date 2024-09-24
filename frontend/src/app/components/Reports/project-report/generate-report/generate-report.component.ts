import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { BehaviorSubject, Observable, Subject, catchError, of, takeUntil, tap } from 'rxjs';
import { ReportFormat, ReportPanelSource } from 'src/Enumerations';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ReportData } from 'src/app/shared/models/reports/report.data';
import { User } from 'src/app/shared/models/user';
import { read, utils } from 'xlsx';
import { ReportPreviewModel } from '../report-preview/report-preview.model';
import { ProjectReportModel } from './generate-report.model';
const { sheet_to_json } = utils;
@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
})
export class GenerateReportComponent implements OnInit, OnDestroy {
    @Input()
    user: User;

    @Input()
    reportData: ReportData;

    reportList$: BehaviorSubject<ProjectReportModel[]> = new BehaviorSubject<ProjectReportModel[]>([]);
    reports$: Observable<ProjectReportModel[]>;
    searchText = '';
    isLoading = false;
    destroyed$ = new Subject<boolean>();
    canGenerateReport = false;
    pageTitle: string;
    selectedReport: ProjectReportModel;
    reportError = '';
    isPreview = false;
    previewExcel: string[][] = [];
    preview: any;
    previewError = '';
    format = ReportFormat.TEXT;

    constructor(private projectReportService: ProjectReportService, private eventBus: NgEventBus) {}

    ngOnInit(): void {
        this.canGenerateReport = this.reportData?.pageSource === ReportPanelSource.Dashboard;
        this.pageTitle = this.reportData?.generateReportTitle;
        this.reports$ = this.reportList$.asObservable();
        this.getReports();
        this.eventBus
            .on('Report:AfterAddReport')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.getReports();
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.reportList$.complete();
    }

    loadReports(): Observable<ProjectReportModel[]> {
        this.isLoading = true;
        return this.projectReportService
            .getProjectReports({
                roleId: this.user.role,
            })
            .pipe(
                tap(() => (this.isLoading = false)),
                catchError(() => of([]))
            );
    }

    getReports(): void {
        this.loadReports().subscribe((response) => {
            this.reportList$.next(response);
        });
    }

    trackByFn(index: number, report: ProjectReportModel): number {
        return report.id;
    }

    refreshReports(id: number): void {
        const updatedReport = this.reportList$.getValue().filter((report: ProjectReportModel) => report.id !== id);
        this.reportList$.next(updatedReport);
    }

    selectReport(report: ProjectReportModel): void {
        this.highlightSelectedReport(report);
        report.isSelected = true;
        this.selectedReport = report;
        this.reportError = '';
    }

    highlightSelectedReport(selectedReport: ProjectReportModel): void {
        const updatedReport = this.reportList$.getValue().map((report: ProjectReportModel) => {
            return { ...report, isSelected: selectedReport.id === report.id };
        });
        this.reportList$.next(updatedReport);
    }

    generateReport(): void {
        this.isLoading = true;
        this.reportError = '';
        this.projectReportService
            .generateReport(this.selectedReport, this.reportData.projectDetails, this.user)
            .pipe(
                takeUntil(this.destroyed$),
                catchError(() => of(undefined))
            )
            .subscribe((response) => {
                this.isLoading = false;
                if (response) {
                    const fileName = response.fileName;
                    const reportFileName = fileName.replace(/-\d+/, '');
                    this.projectReportService.downloadReport(response.file, reportFileName);
                } else {
                    this.reportError =
                        'Error: XSL translation failed. Please check your XSLT implementation as this might affect report generation.';
                }
            });
    }

    previewReport(): void {
        this.isLoading = true;
        this.projectReportService
            .getPreview(this.selectedReport, this.reportData.projectDetails, this.user)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                this.reportPreview(response);
            });
    }

    back(): void {
        this.togglePreview();
        this.previewExcel = [];
    }

    togglePreview(): void {
        this.isPreview = !this.isPreview;
    }
    tableHeaders: string[] = [];
    previewReportFile(reportPreviewModel: ReportPreviewModel): void {
        const XsltFile = new Blob([reportPreviewModel.report], { type: `.${reportPreviewModel.report}` });
        XsltFile.arrayBuffer()
            .then((buff: ArrayBuffer) => {
                const fileData = new Uint8Array(buff);
                const workbook = read(fileData, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const sheetJson: any[] = sheet_to_json(worksheet, { header: 1 });
                this.tableHeaders = sheetJson[0];
                this.previewExcel = sheetJson.slice(1);
            })
            .catch(() => {
                this.previewError = 'Report could not be generated';
            });
    }

    private reset() {
        this.format = ReportFormat.TEXT;
        this.previewError = '';
        this.preview = [];
        this.previewExcel = [];
    }

    private reportPreview(response: ReportPreviewModel): void {
        this.isLoading = false;
        this.togglePreview();
        if (response) {
            this.format = ReportFormat[response.format];
            if (response.format === ReportFormat.XLSX) {
                this.previewReportFile(response);
            } else if (response.format === ReportFormat.HTML) {
                this.preview = response.report.replace(`<!DOCTYPE HTML>`, '');
            } else {
                this.preview = response.report.split('\n');
            }
        } else {
            this.reset();
            this.previewError = 'Report could not be generated';
        }
    }
}
