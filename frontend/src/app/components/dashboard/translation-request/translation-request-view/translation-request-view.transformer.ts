import { Injectable } from '@angular/core';
import {
    TranslationRequestForLanguage,
    TranslationRequestForProject,
    TranslationRequestViewModel,
} from './translation-request-view.model';

@Injectable({
    providedIn: 'root',
})
export class TranslationRequestViewTransformer {
    transform(response): TranslationRequestViewModel {
        return {
            translationRequestsForProject: this.getTranslationRequestsForProject(response.data.data),
            totalTranslationRequest: response.data.totalTranslationRequest,
            cols: this.getCols(),
            colsForExpandedRow: this.getColsForExpandedRow(),
        };
    }

    private getTranslationRequestsForProject(translationRequestsForProject: TranslationRequestForProject[]) {
        return translationRequestsForProject.map((translationRequestForProject) => {
            return {
                ...translationRequestForProject,
                version: this.getVersion(translationRequestForProject.version_id),
                returnedLanguages: this.getTranslatedLanguage(translationRequestForProject.language_code),
            };
        });
    }
    private getTranslatedLanguage(translationRequestsForLanguage: TranslationRequestForLanguage[]) {
        const translatedRequestForLanguage = translationRequestsForLanguage.filter(
            (translationRequestForLanguage) => !!translationRequestForLanguage.returnedStatus
        );
        return `${translatedRequestForLanguage.length}/${translationRequestsForLanguage.length}`;
    }
    private getColsForExpandedRow() {
        return [
            {
                field: 'language',
                header: 'Languages',
            },
            {
                field: 'translationProgress',
                header: 'Translation Progress',
            },
            {
                field: 'returnedStatus',
                header: 'Returned',
            },
            {
                field: 'importedStatus',
                header: 'Imported Status',
            },
        ];
    }
    private getCols() {
        return [
            {
                field: 'title',
                header: 'Name',
                type: 'text',
            },
            {
                field: 'version',
                header: 'Version',
                type: 'numeric',
            },
            {
                field: 'due_date',
                header: 'Due Date',
                type: 'date',
            },
            {
                field: 'source_language',
                header: 'Source Language',
                type: 'text',
            },
            {
                field: 'project_manager_status',
                header: 'Returned Languages',
                type: 'text',
            },
            {
                field: 'project_manager_email',
                header: 'Assigned Project Manager',
                type: 'text',
            },
            {
                field: 'proofread',
                header: 'Proofread',
                type: 'text',
            },
            {
                field: 'attachments',
                header: 'Attachments',
            },
            {
                field: 'status',
                header: 'Status',
            },
        ];
    }

    private getVersion = (versionId: number) => {
        return +versionId.toString().split('.')[1];
    };
}
