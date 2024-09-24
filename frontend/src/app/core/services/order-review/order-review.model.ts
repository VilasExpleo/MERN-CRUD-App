export class OrderReviewStateModel {
    projectId: number;
    versionId: string;
    editorLanguage: ReviewerLanguageModel;
    supplierLanguage?: ReviewerLanguageModel;
    availableLanguages?: ReviewerLanguageModel[];
    targetLanguages?: ReviewerLanguageModel[];
    selectedLanguage?: ReviewerLanguageModel;
    dueDate?: Date;
    sourceLanguages?: ReviewerLanguageModel[];
    selectedFiles?: any[];
    reviewers?: ReviewerModel[];
    statistics?: {
        data: any;
        options: any;
    };
    reviewTypes?: ViewTypeOption[];
    selectedReviewType?: ViewTypeOption;
}

export interface ReviewerLanguageModel {
    languageCode: string;
    languageId: number;
    reviewer?: ReviewerModel;
}

export interface ReviewerModel {
    id: number;
    name: string;
    email: string;
}

export const initializeOrderReviewState: OrderReviewStateModel = {
    projectId: 0,
    versionId: '',
    targetLanguages: [],
    editorLanguage: {
        languageCode: '',
        languageId: 0,
        reviewer: {
            id: 0,
            name: '',
            email: '',
        },
    },
    dueDate: new Date(),
    sourceLanguages: [],
    selectedFiles: [],
    reviewers: [],
    statistics: {
        data: {},
        options: {},
    },
    reviewTypes: [],
};

export interface ViewTypeOption {
    label: string;
    value: string;
}
