import { Injectable } from '@angular/core';
import { Column, SelectedLanguage, TranslationRequestModel } from './reference-language.model';

@Injectable({
    providedIn: 'root',
})
export class TranslationRequestTransformer {
    transform(languageStateResponse, statisticsStateResponse, referenceStateResponse): TranslationRequestModel {
        return {
            cols: this.getCols(),
            description: this.getDescription(),
            selectedLanguages: statisticsStateResponse?.translation_languages.map((language) => {
                return {
                    ...language,
                    additional_languages: this.getAdditionalLanguage(language, referenceStateResponse),
                    isDone: this.getLanguageIsDone(language, referenceStateResponse),
                };
            }),
            availableLanguages: languageStateResponse?.availableLanguages.map((language) => {
                return {
                    language_code: language.name,
                    language_id: language.id,
                    is_done: false,
                };
            }),
        };
    }

    private getAdditionalLanguage(selectedLanguage: SelectedLanguage, referenceLanguageState) {
        return (
            referenceLanguageState?.translation_languages?.find(
                (language) => language.language_id === selectedLanguage.language_id
            )?.additional_languages ?? []
        );
    }

    private getLanguageIsDone(selectedLanguage: SelectedLanguage, referenceLanguageState): boolean {
        return (
            referenceLanguageState?.translation_languages?.find(
                (language) => language.language_id === selectedLanguage.language_id
            )?.isDone ?? false
        );
    }

    private getCols(): Column[] {
        return [
            {
                header: 'Selected Languages',
            },
            {
                header: 'Reference Languages',
            },
            {
                header: 'Include only texts in status "Done"',
            },
        ];
    }

    private getDescription(): string {
        return `Select the language for which you want to be a reference language`;
    }
}
