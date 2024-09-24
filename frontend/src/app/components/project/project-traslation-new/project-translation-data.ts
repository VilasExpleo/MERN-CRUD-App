import { LabelOperations } from 'src/app/shared/models/labels/label-operations.model';

export interface ProjectTranslationData {
    dbTextNodeId: number;
    status: string;
    source: string;
    languageId: number;
    translation: string;
    textNodeId: number;
    languageGroup: LanguageGroup[];
}

export interface LanguageGroup {
    languageId: number;
    translation: string;
    status: string;
    labels: LabelOperations[];
}
