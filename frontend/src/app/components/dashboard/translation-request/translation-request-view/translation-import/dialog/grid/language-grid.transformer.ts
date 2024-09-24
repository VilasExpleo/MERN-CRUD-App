import { Injectable } from '@angular/core';
import { TranslationImportService } from 'src/app/core/services/translation-import/translation-import.service';
import { LanguageGridModel } from './language-grid.model';

@Injectable({
    providedIn: 'root',
})
export class LanguageGridTransformer {
    constructor(private translationImportService: TranslationImportService) {}

    transform(): LanguageGridModel[] {
        const languages = this.translationImportService.getTranslationOrderParameters()?.['language_code'];
        return languages
            .filter((language) => !!language.returnedStatus && language.translationProgress !== 0)
            .map((language) => ({
                languageId: language.languageId,
                languageCode: language.language,
                checkListStatus: language.checkListStatus,
            }));
    }
}
