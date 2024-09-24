import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ProjectReportService } from 'src/app/core/services/reports/project-report.service';
import { ScheduleService } from 'src/app/core/services/reports/schedule.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ProjectReportRequestModel } from 'src/app/shared/models/reports/project-report-request.model';
import { ReportData } from 'src/app/shared/models/reports/report.data';
import { ScheduleModel, ScheduleReportRequestModel } from 'src/app/shared/models/reports/schedule-report-request.model';
import { User } from 'src/app/shared/models/user';
import { ProjectReportModel } from '../generate-report/generate-report.model';
import { CreateScheduleModel } from './create-schedule/create-schedule.model';

@Component({
    selector: 'app-schedule-report',
    templateUrl: './schedule-report.component.html',
    styleUrls: ['./schedule-report.component.scss'],
})
export class ScheduleReportComponent implements OnInit {
    @Input()
    user: User;

    @Input()
    reportData: ReportData;

    isLoading = false;
    searchText = '';
    reportError = '';
    scheduleReportList$: BehaviorSubject<ProjectReportModel[]> = new BehaviorSubject<ProjectReportModel[]>([]);
    scheduleReports$: Observable<ProjectReportModel[]>;
    reportSchedules: CreateScheduleModel[] = [];

    constructor(
        private projectReportService: ProjectReportService,
        private scheduleService: ScheduleService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getScheduleReports();
        this.scheduleReports$ = this.scheduleReportList$.asObservable();
    }

    getScheduleReports() {
        const payload: ProjectReportRequestModel = {
            userId: this.user.id,
            projectId: this.reportData.projectDetails.project_id,
            roleId: this.user.role,
        };
        this.loadReports(payload).subscribe((response) => {
            this.scheduleReportList$.next(response);
        });
    }

    loadReports(payload: ProjectReportRequestModel): Observable<ProjectReportModel[]> {
        this.isLoading = true;
        return this.projectReportService.getProjectReports(payload).pipe(
            tap(() => (this.isLoading = false)),
            catchError(() => of([]))
        );
    }

    trackByFn(index: number, report: ProjectReportModel): number {
        return report.id;
    }

    schedule() {
        this.reportSchedules = this.scheduleService.reportSchedules$.value;
        const payload: ScheduleReportRequestModel = {
            scheduleData: this.schedules(this.reportSchedules),
            creatorId: this.user.id,
            projectId: this.reportData.projectDetails.project_id,
        };
        if (payload) {
            this.scheduleService
                .scheduleReport(payload)
                .pipe(tap(() => (this.isLoading = false)))
                .subscribe({
                    next: (response: ApiBaseResponseModel) => {
                        this.scheduleService.reportSchedules$.next([]);
                        this.getScheduleReports();
                        if (response.status === ResponseStatusEnum.OK) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Report successfully scheduled',
                            });
                        }
                    },
                });
        }
    }

    schedules(schedules: CreateScheduleModel[]): ScheduleModel[] {
        return [...schedules];
    }

    showScheduleError(error: string) {
        this.reportError = error;
    }
}
