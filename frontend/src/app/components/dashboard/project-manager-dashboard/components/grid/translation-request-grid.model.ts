export interface Status {
    label: string;
    value: number;
}

export interface Sort {
    field: string;
}

export interface Filter {
    field: string;
    display: string;
    hideOnClear?: boolean;
    matchMode?: string;
    template?: boolean;
    type?: string;
}

export interface Column {
    field: string;
    header: string;
    sort?: Sort;
    filter?: Filter;
}

export interface ProjectTranslationRequest {
    id: number;
    description: string;
    editorDueDate: Date;
    dueDateToProjectManager: Date;
    editorTranslationStatus: number;
    languages: LanguageTranslationRequest[];
    projectId: number;
    versionId: number;
    projectManagerId: number;
    isProofReadable: boolean;
    proofread: string;
    projectTitle: string;
    document?: string;
    progress?: number;
    remainingTime?: number;
    translationRequest?: string;
    documentCount: number;
    brandName: string;
}

export interface LanguageTranslationRequest {
    id: number;
    languageCode: string;
    languageId: number;
    status: number;
    progress: number;
    projectId: number; // TODO: non required parameter as languages are already bind with one project data
    returnDate: string;
    translationManagerEmail: string;
    translationManagerId: number;
    totalWordCount: number;
    translationRequest: string;
    translationRequestId: number;
    versionId: number;
}

export interface TranslationRequestGridModel {
    colsForExpandedRow: Column[];
    projects: ProjectTranslationRequest[];
}
