import { Injectable } from '@angular/core';
import {
    DocumentsModel,
    TranslationRequestsModel,
} from 'src/app/shared/models/TranslationRequest/translation-request-response.model';
@Injectable({
    providedIn: 'root',
})
export class ViewDocumentsComponentTransformer {
    transform(response): TranslationRequestsModel {
        return {
            documents: this.document(response.documents),
            checklist: response?.checklist || [],
            referenceLanguages: response.referenceLanguage,
        };
    }

    private document(documents): DocumentsModel {
        return {
            editor: documents?.editor || [],
            projectManager: documents?.projectmanager || [],
            translationManager: documents?.translationmanager || [],
        };
    }
}
