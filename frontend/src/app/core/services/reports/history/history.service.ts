import { ProjectReportModel } from './../../../../components/Reports/project-report/generate-report/generate-report.model';
import { ApiBaseResponseModel } from './../../../../shared/models/api-base-response.model';
import { map, catchError, of, Observable } from 'rxjs';
import { HistoryTransformer } from 'src/app/components/Reports/project-report/history/history.transformer';
import { ReportHistoryRequestModel } from './../../../../shared/models/reports/report-history.request.model';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    constructor(private apiService: ApiService, private historyTransformer: HistoryTransformer) {}

    getReportsHistory(payload: ReportHistoryRequestModel): Observable<ProjectReportModel[]> {
        return this.apiService.getRequest(`report/history/${payload.projectId}/${payload.creatorId}`).pipe(
            catchError(() => of({ data: {} })),
            map((response: ApiBaseResponseModel) => this.historyTransformer.transform(response))
        );
    }

    deleteReportHistory(reportHistoryId: number): Observable<ApiBaseResponseModel> {
        return this.apiService.deleteRequest(`report/history/${reportHistoryId}`);
    }
}
