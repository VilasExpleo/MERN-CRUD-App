import { Injectable } from '@angular/core';
import { LanguageModel } from '../manage-raw-project-state.model';

@Injectable({
    providedIn: 'root',
})
export class LanguageTransformer {
    transform(languages): LanguageModel[] {
        return languages.map((language) => ({
            languageId: language.language_id,
            languageCode: language.language_culture_name,
        }));
    }
}
