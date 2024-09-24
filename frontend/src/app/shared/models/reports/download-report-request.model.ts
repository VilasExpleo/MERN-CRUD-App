import { ProjectReportBaseModel } from './schedule-report-request.model';

export interface DownloadReportRequestModel extends ProjectReportBaseModel {
    reportId: number;
}
