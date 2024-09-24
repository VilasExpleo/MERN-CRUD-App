// TODO: move this model to finish dialog model
// TODO: Verify the name against its functionality
export interface TranslationResponse {
    totalCount: number;
    completedCount: number;
    projectManagerDueDate?: Date;
    dueDate?: Date;
}

export const initialTranslationResponse: TranslationResponse = {
    totalCount: 0,
    completedCount: 0,
};
export interface UpdateTranslationRequest {
    isAssigned: boolean;
    dueDatePM: Date;
}
