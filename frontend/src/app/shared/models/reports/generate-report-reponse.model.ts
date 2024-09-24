export interface GenerateReportResponseModel {
    reportFile: string;
}

export interface DownloadReportModel {
    fileName: string;
    file: Blob;
}
