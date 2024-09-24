export interface ReassignProofreaderRequestModel {
    translationRequestId: number;
    projectId: number;
    proofreaderId: number;
    proofreaderEmail: string;
    languageId: number;
}
