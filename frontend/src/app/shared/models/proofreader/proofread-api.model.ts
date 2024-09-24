export interface ProofreadTranslationRequestModel {
    projectId: number;
    versionId: number;
    userId: number;
    translationRequestId: number;
    comments: Textnode[];
}

interface Textnode {
    nodeId: number;
    arrayItemIndex: number;
    variantId: number;
    status: number;
    comment: string;
    languageCode: string;
    dbProjectTextNodeId: number;
    languageId: number;
}

export interface ProofreaderDashboardRequestModel {
    userId: number;
    start: number;
    end: number;
}

export interface ProofreaderDashboardResponseModel {
    data: ProofreaderRequestModel[];
    message: string;
    status: string;
}

export interface ProofreaderRequestModel {
    brandId: number;
    brandName: string;
    document: string;
    dueDate: string;
    languages: LanguageWiseProofreaderModel[];
    projectId: number;
    projectName: string;
    sourceLanguage: Language[];
    status: number;
    translationRequestId: number;
    versionId: number;
    description?: string;
    documentCount: number;
    lcPath?: string;
    fontPath?: string;
}

export interface LanguageWiseProofreaderModel {
    pendingNodes: number;
    progress: number;
    proofreadNodes: number;
    returnDate: string;
    targetLanguage: Language[];
    totalNodes: number;
    translatorId: number;
    translatorName: string;
    totalWordCount: number;
}

export interface Language {
    id: number;
    code: string;
}
