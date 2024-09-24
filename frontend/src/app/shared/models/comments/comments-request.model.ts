export interface CommentsRequestModel {
    userId: number;
    dbProjectTextNodeId: number;
    languageId?: number;
    translationRequestId?: number;
}
