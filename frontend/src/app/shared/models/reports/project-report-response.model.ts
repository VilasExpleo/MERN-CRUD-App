import { ProjectReportScheduleResponseModel } from './project-report-schedule-response.model';

export interface ProjectReportResponseModel {
    reportId: number;
    reportName: string;
    reportFormat: string;
    isStandard: boolean;
    description: string;
    scheduleData?: ProjectReportScheduleResponseModel;
}
