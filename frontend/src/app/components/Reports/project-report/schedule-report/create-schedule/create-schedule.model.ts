export interface CreateScheduleModel {
    reportId: number;
    frequency: string;
    dayOfWeek?: string;
    dayOfMonth?: number;
    scheduleTime: string;
    timeDisplay: string;
}
