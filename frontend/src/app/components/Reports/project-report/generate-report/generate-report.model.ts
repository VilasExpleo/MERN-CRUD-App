import { HistoryModel } from 'src/app/components/Reports/project-report/history/history.model';
import { ScheduleReportModel } from '../schedule-report/schedule-report.model';

export interface ProjectReportModel extends ScheduleReportModel, HistoryModel {
    name: string;
    format: string;
    description?: string;
    id?: number;
    isStandard: boolean;
    isSelected?: boolean;
}
