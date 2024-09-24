export interface ApproveRejectViewRequestModel {
    projectId: number;
    viewName: string;
    reviewStatus: number;
    reviewComment: string;
    lang: string;
    requestId: number;
}
