export interface SanityCheckModel {
    projectManager?: ManagerSanityCheckModel;
    translator?: TranslatorSanityCheckModel;
    reviewer?: ReviewerSanityCheckModel;
    dueDate: Date;
}

export interface TranslatorSanityCheckModel {
    translationProgress: number;
    proofreadProgress: number;
    proofread: boolean;
}

export interface ReviewerSanityCheckModel {
    reviewProgress: number;
}

export interface ManagerSanityCheckModel {
    totalCount: number;
    completedCount: number;
}
