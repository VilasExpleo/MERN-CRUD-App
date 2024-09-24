export interface ReassignWorkerRequestModel {
    translationRequestId: number;
    projectId: number;
    translatorId: number;
    translatorEmail: string;
    languageId: number;
}
