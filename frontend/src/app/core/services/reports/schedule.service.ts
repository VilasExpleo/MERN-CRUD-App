import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, switchMap } from 'rxjs';
import { CreateScheduleModel } from 'src/app/components/Reports/project-report/schedule-report/create-schedule/create-schedule.model';
import { DeleteReportScheduleRequestModel } from 'src/app/shared/models/reports/delete-report-schedule-request.model';
import { DownloadReportRequestModel } from 'src/app/shared/models/reports/download-report-request.model';
import { ScheduleReportRequestModel } from 'src/app/shared/models/reports/schedule-report-request.model';
import { ApiService } from '../api.service';
import {
    DownloadReportModel,
    GenerateReportResponseModel,
} from 'src/app/shared/models/reports/generate-report-reponse.model';

@Injectable({
    providedIn: 'root',
})
export class ScheduleService {
    reportSchedules$: BehaviorSubject<CreateScheduleModel[]> = new BehaviorSubject<CreateScheduleModel[]>([]);
    constructor(private apiService: ApiService) {}

    deleteReportSchedule(reportScheduleId: number) {
        const payload: DeleteReportScheduleRequestModel = {
            scheduleReportId: reportScheduleId,
        };
        return this.apiService.postTypeRequest(`report/schedule/delete`, payload);
    }

    scheduleReport(payload: ScheduleReportRequestModel) {
        return this.apiService.postTypeRequest(`report/schedule`, payload);
    }

    downloadScheduleReport(payload: DownloadReportRequestModel) {
        return this.apiService.postTypeRequest(`report/schedule/download`, payload);
    }

    generateScheduleReport(payload: DownloadReportRequestModel): Observable<DownloadReportModel> {
        return this.downloadScheduleReport(payload).pipe(
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
}
