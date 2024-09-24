import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, take } from 'rxjs';
import { AutomaticSpellcheckTransformer } from 'src/app/components/settings/spell-check/spell-check/automatic-spellcheck/automatic-spellcheck.transformer';
import { SpellCheckTransformer } from 'src/app/components/settings/spell-check/spell-check/spell-check.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AddWordRequestModel } from 'src/app/shared/models/spell-check/add-word.request.model';
import { EditWordRequestModel } from 'src/app/shared/models/spell-check/edit-word.request.model';
import { SelectedPreferenceLanguage } from 'src/app/shared/models/spell-check/selected-preference-languages.response.model';
import { SpellCheckDictionaryResponseModel } from 'src/app/shared/models/spell-check/spell-check-dictionary-response.model';
import { SpellCheckDictionariesRequestModel } from 'src/app/shared/models/spell-check/update-spell-check-dictionaries.request.model';
import { ApiService } from '../api.service';
import { SpellCheckDictionaryModel } from 'src/app/components/settings/spell-check/spell-check/automatic-spellcheck/spell-check-dictionary.model';

@Injectable({
    providedIn: 'root',
})
export class SpellCheckService {
    constructor(
        private apiService: ApiService,
        private automaticSpellcheckTransformer: AutomaticSpellcheckTransformer,
        private spellCheckTransformer: SpellCheckTransformer
    ) {}

    getWords(userId: number) {
        return this.apiService
            .getRequest(`spell-check/custom-dictionary/${userId}`)
            .pipe(map((response: ApiBaseResponseModel) => this.spellCheckTransformer.transform(response.data)));
    }

    add(payload: AddWordRequestModel, userId: number): Observable<ApiBaseResponseModel> {
        return this.apiService.postTypeRequest(`spell-check/custom-dictionary/add/${userId}`, payload);
    }

    edit(payload: EditWordRequestModel, userId: number): Observable<ApiBaseResponseModel> {
        return this.apiService.putTypeRequest(`spell-check/custom-dictionary/${userId}`, payload);
    }

    deleteDictionary(userId: number): Observable<ApiBaseResponseModel> {
        return this.apiService.deleteRequest(`spell-check/custom-dictionary/${userId}`);
    }

    deleteWord(userId: number, word: string): Observable<ApiBaseResponseModel> {
        return this.apiService.deleteRequest(`spell-check/custom-dictionary/${userId}/${word}`);
    }

    getSpellCheckDictionaries(userId: number): Observable<SpellCheckDictionaryModel[]> {
        const dictionaries$: Observable<SpellCheckDictionaryResponseModel[]> = this.apiService
            .getRequest('spell-check/dictionaries')
            .pipe(map((response: ApiBaseResponseModel) => response?.data));

        const selectedPreferenceLanguage$: Observable<SelectedPreferenceLanguage[]> = this.apiService
            .getRequest(`spell-check/selected-preference-languages/${userId}`)
            .pipe(map((response: ApiBaseResponseModel) => response?.data));

        return combineLatest([dictionaries$, selectedPreferenceLanguage$]).pipe(
            take(1),
            map(([dictionaries, selectedPreferenceLanguage]) =>
                this.automaticSpellcheckTransformer.transform(dictionaries, selectedPreferenceLanguage)
            )
        );
    }

    updateSpellCheckDictionaries(
        payload: SpellCheckDictionariesRequestModel,
        userId: number
    ): Observable<ApiBaseResponseModel> {
        return this.apiService.postTypeRequest(`spell-check/dictionaries/${userId}`, payload);
    }
}
