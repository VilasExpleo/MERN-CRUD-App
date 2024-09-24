import { ReferenceLanguageModel } from 'src/app/components/dashboard/translation-request/editor-translation-request/components/reference-language/reference-language.model';
import { ChecklistModel } from './checklist.model';
export class TranslationRequestsModel {
    documents: DocumentsModel;
    checklist?: ChecklistModel[];
    referenceLanguages?: ReferenceLanguageModel[];
}

export interface DocumentsModel {
    editor: files[];
    projectManager: files[];
    translationManager: files[];
}

export interface files {
    role: string;
    file_name: string;
    created_on: string;
}
