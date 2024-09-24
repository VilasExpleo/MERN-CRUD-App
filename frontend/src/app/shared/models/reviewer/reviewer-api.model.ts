export interface ReviewerDashboardRequestModel {
    userId: number;
    start?: number;
    end?: number;
    filter?: GridFilterModel[];
    sort?: GridSortModel[];
}

export interface GridSortModel {
    column: string;
    order: string;
}

export interface GridFilterModel {
    operator: string;
    condition: string;
    column: string;
    values: GridValueModel[] | string;
}

export interface GridValueModel {
    value: string;
    matchMode: string;
    operator: string;
}

export interface ReviewerDashboardResponseModel {
    message: string;
    status: string;
    data: ReviewerResponseModel[];
}

export interface ReviewerResponseModel {
    projectName: string;
    projectId: number;
    versionId: number;
    requestId: number;
    dueDate: string;
    status: number;
    sourceLanguage: LanguageModel;
    document: string;
    targetLanguages: RequestPerLanguage[];
    returnCount?: string;
    documentCount: number;
    reviewType?: string;
    lcPath?: string;
    fontPath?: string;
}

export interface RequestPerLanguage {
    progress: number;
    targetLanguage: LanguageModel;
    pendingNodes: number;
    rejectedNodes: number;
    approvedNodes: number;
    returnDate: string;
    totalTextNodeCount: number;
    reviewerEmail?: string;
    doneNodes: number;
}

export interface LanguageModel {
    // TODO: Needs to check if we need id somewhere otherwise remove this model and just pass the code
    id: number;
    code: string;
}

export interface ReviewerTranslationRequestModel {
    projectId: number;
    versionId: number;
    userId: number;
    requestId: number;
    reviewType: string;
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
