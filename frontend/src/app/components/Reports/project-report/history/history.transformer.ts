import { ReportHistoryResponseModel } from './../../../../shared/models/reports/report-history.response.model';
import { Injectable } from '@angular/core';
import { ProjectReportModel } from '../generate-report/generate-report.model';

@Injectable({
    providedIn: 'root',
})
export class HistoryTransformer {
    transform(response): ProjectReportModel[] {
        return this.getTransformedHistory(response?.data);
    }

    private getTransformedHistory(reports: ReportHistoryResponseModel[]): ProjectReportModel[] {
        return (
            reports?.map((report: ReportHistoryResponseModel) => ({
                name: report.reportName,
                format: report.reportFormat,
                isStandard: report.isStandard,
                scheduleId: report?.reportHistoryId,
                scheduleTime: report?.generatedOn,
                reportFilePath: report?.reportFilePath,
                status: report?.status ?? false,
            })) ?? []
        );
    }
}
