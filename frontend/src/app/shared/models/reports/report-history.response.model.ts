export interface ReportHistoryResponseModel {
    reportHistoryId: number;
    reportName: string;
    reportFilePath: string;
    generatedOn: string;
    isStandard: boolean;
    reportFormat: string;
    status: boolean;
}
