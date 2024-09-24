export interface RejectOrderRequestModel {
    translationRequestId: number;
    projectId: number;
    status: number;
    reason: string;
    userId?: number;
    userRole?: string;
    languageId?: number;
}
