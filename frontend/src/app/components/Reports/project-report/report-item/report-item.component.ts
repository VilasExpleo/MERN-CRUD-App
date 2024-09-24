import { ApiBaseResponseModel } from './../../../../shared/models/api-base-response.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { ReportTabNameEnum, ResponseStatusEnum, Roles } from 'src/Enumerations';
import { LogService } from 'src/app/core/services/logService/log.service';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ScheduleService } from 'src/app/core/services/reports/schedule.service';
import { DownloadReportRequestModel } from 'src/app/shared/models/reports/download-report-request.model';
import { ScheduleFrequencyEnum } from 'src/app/shared/models/reports/schedule-frequency.enum';
import { User } from 'src/app/shared/models/user';
import { ProjectReportModel } from '../generate-report/generate-report.model';
import { CreateScheduleComponent } from '../schedule-report/create-schedule/create-schedule.component';
import { HistoryService } from 'src/app/core/services/reports/history/history.service';

@Component({
    selector: 'app-report-item',
    templateUrl: './report-item.component.html',
})
export class ReportItemComponent implements OnInit {
    @Input()
    report: ProjectReportModel;

    @Output()
    refreshReports = new EventEmitter<number>();

    @Output()
    showScheduleError = new EventEmitter<string>();

    @Output()
    refreshSchedule = new EventEmitter();

    @Input()
    user: User;

    @Input()
    tab: string;

    @Input()
    projectId: number;

    isEditor = false;

    constructor(
        private projectReportService: ProjectReportService,
        private logService: LogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService,
        private scheduleService: ScheduleService,
        private historyService: HistoryService
    ) {}

    ngOnInit(): void {
        this.isEditor = this.user?.role === Roles.editor;
    }

    delete(id: number) {
        this.projectReportService.deleteProjectReport(id).subscribe({
            next: (response: any) => {
                if (this.isResponseOk(response)) {
                    this.refreshReports.emit(id);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error in deleting report',
                    });
                }
            },
        });
    }

    private isResponseOk(response) {
        return response['status']?.toLowerCase() === ResponseStatusEnum.OK.toLowerCase();
    }

    confirmDelete() {
        this.confirmationService.confirm({
            message: 'You are about to delete a report. Are you sure you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.delete(this.report.id);
            },
            reject: (type: ConfirmEventType) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        });
                        break;
                    case ConfirmEventType.CANCEL:
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Cancelled',
                            detail: 'You have cancelled',
                        });
                        break;
                }
            },
        });
    }

    isGenerateTab() {
        return this.tab === 'generate';
    }

    confirmScheduleDelete() {
        this.confirmationService.confirm({
            message: 'You are about to delete a schedule. Are you sure you want to proceed?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteSchedule(this.report.scheduleId);
            },
            reject: (type: ConfirmEventType) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        });
                        break;
                    case ConfirmEventType.CANCEL:
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Cancelled',
                            detail: 'You have cancelled',
                        });
                        break;
                }
            },
        });
    }

    deleteSchedule(id: number) {
        this.scheduleService.deleteReportSchedule(id).subscribe({
            next: (response: any) => {
                if (this.isResponseOk(response)) {
                    this.refreshSchedule.emit();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error in deleting report',
                    });
                }
            },
            error: (error) => {
                error.error?.message?.forEach((ele: string) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: ele, sticky: true });
                    this.logService.log(`${error}`);
                });
            },
        });
    }

    createSchedule() {
        this.scheduleReport('Schedule Report');
    }

    updateSchedule() {
        this.scheduleReport('Reschedule Report');
    }

    private scheduleReport(header: string): void {
        this.dialogService.open(CreateScheduleComponent, {
            header: header,
            width: '25%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: this.report,
        });
    }
    private getOrdinalNumber(day: number): string {
        const suffixes = ['st', 'nd', 'rd'];
        const remainder = day % 10;
        return day + (suffixes[(remainder - 1) % 10] || 'th');
    }

    checkFrequency(frequency: string) {
        return ScheduleFrequencyEnum[frequency];
    }

    frequency(frequency: string): string {
        switch (frequency) {
            case ScheduleFrequencyEnum.Weekly:
                return this.report?.dayOfWeek;
            case ScheduleFrequencyEnum.Monthly:
                return this.getOrdinalNumber(this.report?.dayOfMonth);
            default:
                return '';
        }
    }

    download() {
        if (this.tab === ReportTabNameEnum.History) {
            const url = `common/download?fileKey=${this.report.reportFilePath}`;
            this.projectReportService.downloadReportTemplateXSD(url, this.getReportFileName(this.report.name));
        } else {
            this.showScheduleError.emit('');
            const payload: DownloadReportRequestModel = {
                creatorId: this.user.id,
                reportId: this.report?.id,
                projectId: this.projectId,
            };
            this.scheduleService
                .generateScheduleReport(payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response) => {
                    if (response) {
                        this.projectReportService.downloadReport(
                            response.file,
                            this.getReportFileName(response?.fileName)
                        );
                    } else {
                        this.showScheduleError.emit(`Error: Issue in scheduled download report`);
                    }
                });
        }
    }

    private getReportFileName(fileName: string): string {
        return fileName?.replace(/-\d+/, '');
    }

    deleteReportHistory(reportHistoryId: number) {
        this.historyService
            .deleteReportHistory(reportHistoryId)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    if (response.status === ResponseStatusEnum.OK) {
                        this.refreshSchedule.emit();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.message,
                        });
                    }
                },
            });
    }
}
