import { HistoryService } from 'src/app/core/services/reports/history/history.service';
import { ProjectReportModel } from './../generate-report/generate-report.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { ReportHistoryRequestModel } from 'src/app/shared/models/reports/report-history.request.model';
import { ReportData } from 'src/app/shared/models/reports/report.data';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
    @Input()
    user: User;

    @Input()
    reportData: ReportData;

    isLoading = false;
    searchText = '';
    historyList$: BehaviorSubject<ProjectReportModel[]> = new BehaviorSubject<ProjectReportModel[]>([]);
    history$: Observable<ProjectReportModel[]>;

    constructor(private historyService: HistoryService) {}

    ngOnInit(): void {
        this.history$ = this.historyList$.asObservable();
        this.loadReportsHistory();
    }

    loadReportsHistory() {
        this.isLoading = true;
        const payload: ReportHistoryRequestModel = {
            creatorId: this.user.id,
            projectId: this.reportData.projectDetails.project_id,
        };
        this.historyService
            .getReportsHistory(payload)
            .pipe(tap(() => (this.isLoading = false)))
            .subscribe((response) => {
                this.historyList$.next(response);
            });
    }

    trackByFn(report: ProjectReportModel): number {
        return report.scheduleId;
    }
}
