export interface LabelAssignRequestModel {
    elementId: number;
    elementType: string;
    role: string;
    labelId: number[];
    languageCode?: string;
}
