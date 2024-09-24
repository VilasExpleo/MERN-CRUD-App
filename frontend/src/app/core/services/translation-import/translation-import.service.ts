import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { LanguageModel } from 'src/app/components/dashboard/translation-request/translation-request-view/translation-import/dialog/grid/language-grid.model';
import { ImportLanguageModel } from 'src/app/components/dashboard/translation-request/translation-request-view/translation-import/dialog/import-languages.model';
import { ImportLanguageTransformer } from 'src/app/components/dashboard/translation-request/translation-request-view/translation-import/dialog/import-languages.transformer';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class TranslationImportService {
    constructor(
        private apiService: ApiService,
        private userService: UserService,
        private importLanguageTransformer: ImportLanguageTransformer
    ) {}

    getTranslationRequestVersion(): Observable<ImportLanguageModel> {
        const url = `translation-import/get-project-versions`;
        const translationOrder = this.getTranslationOrderParameters();

        return this.apiService
            .postTypeRequest(url, { translationRequestId: translationOrder?.id })
            .pipe(map((response) => this.importLanguageTransformer.transform(response, translationOrder?.['title'])));
    }

    createNewTranslationImportRequest(url, payload) {
        return this.apiService.postTypeRequest(url, payload);
    }

    getTranslationOrderParameters() {
        return JSON.parse(localStorage?.getItem('translationOrderData'));
    }

    createTranslationImportPayload(selectedLanguages, description, project) {
        const translationOrder = this.getTranslationOrderParameters();
        return {
            projectId: project?.projectId,
            versionId: project?.versionId,
            translationRequestId: translationOrder?.id,
            sourceLanguageCode: translationOrder?.source_language,
            translationLanguages: selectedLanguages,
            description: description || '',
        };
    }

    getChecklist(language: LanguageModel) {
        const translationOrder = this.getTranslationOrderParameters();
        const userInfo = this.userService.getUser();
        const url = 'translation-request/get-checklist';
        const payload = {
            translationRequestId: translationOrder?.id,
            languageId: language.languageId,
            userId: userInfo.id,
            userRole: Roles[userInfo.role],
        };
        return this.apiService.postTypeRequest(url, payload);
    }
}
