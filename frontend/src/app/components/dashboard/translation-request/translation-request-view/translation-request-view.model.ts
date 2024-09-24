export interface TranslationRequestViewModel {
    translationRequestsForProject: TranslationRequestForProject[];
    totalTranslationRequest: number;
    colsForExpandedRow: Column[];
    cols: Column[];
}
export interface TranslationRequestForProject {
    project_id: number;
    version_id: number;
    title: string;
    id: number;
    description: string;
    due_date: string;
    project_manager_email: string;
    project_manager_status: number;
    proofread: string;
    project_manager_return_date: string;
    language_code: TranslationRequestForLanguage[];
    UploadedFiles: UploadedFiles;
}

export interface TranslationRequestForLanguage {
    language: string;
    returnedStatus: string;
    importedStatus: string;
    totalTranslationTextNode: number;
    translationProgress: number;
    returnedDate: string;
}
export interface UploadedFiles {
    projectManager?: RoleFileMapping[];
    translationManager?: RoleFileMapping[];
    editor?: RoleFileMapping[];
}

export interface RoleFileMapping {
    role: string;
    fileName: string;
}
export interface Column {
    field: string;
    header: string;
    type?: string;
}
export const initialTranslationRequestViewModel: TranslationRequestViewModel = {
    translationRequestsForProject: [],
    totalTranslationRequest: 0,
    colsForExpandedRow: [],
    cols: [],
};
