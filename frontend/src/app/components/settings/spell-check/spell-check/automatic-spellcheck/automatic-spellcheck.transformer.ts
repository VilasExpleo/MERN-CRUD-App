import { Injectable } from '@angular/core';
import { SpellCheckDictionaryModel } from './spell-check-dictionary.model';
import { SpellCheckDictionaryResponseModel } from 'src/app/shared/models/spell-check/spell-check-dictionary-response.model';
import { SelectedPreferenceLanguage } from 'src/app/shared/models/spell-check/selected-preference-languages.response.model';

@Injectable({
    providedIn: 'root',
})
export class AutomaticSpellcheckTransformer {
    transform(
        response: SpellCheckDictionaryResponseModel[],
        selectedPreferenceLanguagesResponse: SelectedPreferenceLanguage[]
    ): SpellCheckDictionaryModel[] {
        return response.map((language) => {
            return {
                ...language,
                isDictionaryAvailable: !!selectedPreferenceLanguagesResponse.find(
                    (selectedLanguage) => selectedLanguage.languageId === language.languageId
                ),
            };
        });
    }
}
