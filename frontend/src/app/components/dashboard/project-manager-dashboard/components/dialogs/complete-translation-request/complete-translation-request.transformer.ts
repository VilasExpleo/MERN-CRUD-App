import { Injectable } from '@angular/core';
import { LanguageTranslationRequest, ProjectTranslationRequest } from '../../grid/translation-request-grid.model';
import { TranslationResponse } from './complete-translation-request.model';
@Injectable({
    providedIn: 'root',
})
export class FinishDialogTransformer {
    transform(project: Partial<ProjectTranslationRequest>): TranslationResponse {
        return {
            projectManagerDueDate: new Date(project.dueDateToProjectManager),
            completedCount: this.completedTranslations(project['languages']),
            totalCount: project['languages']?.length,
        };
    }

    private completedTranslations(languages: LanguageTranslationRequest[]) {
        if (languages?.length) {
            return 0;
        }

        return languages.filter((language: LanguageTranslationRequest) => language.returnDate !== '').length;
    }
}
