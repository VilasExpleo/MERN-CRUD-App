import { LabelOperations } from 'src/app/shared/models/labels/label-operations.model';
export interface TranslationStatusBarModel {
    proofReadStatus: string;
    proofReaderComment: string;
    reviewerStatus: string;
    reviewerComment: string;
    screenReviewStatus: string;
    icon: string;
    date: string;
    name: string;
    screenReviewComment: string;
    languageParentId?: number;
}
export interface TableStatusModel {
    proofread_status: string;
    proofread_comment: string;
    review_comment: string;
    review_status: string;
    screen_review_status: string;
    screen_review_comment: string;
    languageWiseLabels: LabelOperations[];
}

export interface StatusFlagsModel {
    isProofreadRejected: boolean;
    isReviewRejected: boolean;
    isScreenReviewRejected: boolean;
}

export interface NodeStatusModel {
    proofReadStatus: string;
    proofReaderComment: string;
    reviewerStatus: string;
    screenReviewStatus: string;
    reviewerComment: string;
    screenReviewComment: string;
}
