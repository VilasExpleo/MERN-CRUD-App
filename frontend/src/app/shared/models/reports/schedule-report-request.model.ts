export interface ScheduleReportRequestModel extends ProjectReportBaseModel {
    scheduleData: ScheduleModel[];
}
export interface ScheduleModel {
    reportId: number;
    frequency: string;
    dayOfWeek?: string;
    dayOfMonth?: number;
    scheduleTime: string;
}

export interface ProjectReportBaseModel {
    projectId: number;
    creatorId: number;
}
