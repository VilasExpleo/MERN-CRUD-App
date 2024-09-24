import { ChecklistModel } from './checklist.model';

export interface CheckListUpdateRequestModel {
    projectId: number;
    translationRequestId: number;
    check: ChecklistModel[];
    languageId: number;
}
