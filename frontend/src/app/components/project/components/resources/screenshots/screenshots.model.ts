export interface ResourceModel {
    data?: FileUploadModel;
    isScreenshotUploadInProgress?: boolean;
    isScreenshotReportDownloadButtonVisible?: boolean;
}

export interface FileUploadModel {
    file: File;
    userRole: string;
}

export interface FileState {
    screenshotUploadState: number;
    screenShotFile: File;
}
