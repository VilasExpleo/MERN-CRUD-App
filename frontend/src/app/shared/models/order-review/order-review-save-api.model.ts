export interface OrderReviewSaveRequestModel {
    projectId: number;
    versionId: number;
    sourceId: number;
    sourceLanguage: string;
    dueDate: string;
    editorId: number;
    selectedLanguages: SelectedLanguage[];
    reviewAssignments: ReviewAssignment[];
    reviewType: string;
}

export interface SelectedLanguage {
    languageId: number;
    languageCode: string;
}

export interface ReviewAssignment {
    languageId: number;
    reviewerId: number;
    reviewerEmail: string;
}
