import { Injectable } from '@angular/core';
import { ProjectReportResponseModel } from 'src/app/shared/models/reports/project-report-response.model';
import { ProjectReportModel } from './generate-report.model';

@Injectable({
    providedIn: 'root',
})
export class GenerateReportsTransformer {
    transform(response): ProjectReportModel[] {
        return this.getTransformedReports(response?.data) ?? [];
    }

    private getTransformedReports(reports: ProjectReportResponseModel[]): ProjectReportModel[] {
        return reports?.map((report: ProjectReportResponseModel) => ({
            name: report.reportName,
            format: report.reportFormat,
            description: report.description,
            id: report.reportId,
            isStandard: report.isStandard,
            isSelected: false,
            scheduleId: report?.scheduleData?.id,
            scheduleTime: report?.scheduleData?.scheduleTime,
            dayOfMonth: report?.scheduleData?.dayOfMonth,
            dayOfWeek: report?.scheduleData?.dayOfWeek,
            frequency: report?.scheduleData?.frequency,
        }));
    }
}
