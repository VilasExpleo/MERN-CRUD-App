import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
import { GetUtteranceResponseModel } from 'src/app/shared/models/grammar-parser/get-utterances-response.model';

@Injectable({
    providedIn: 'root',
})
export class CompressDecompressService {
    private utterancesState = new BehaviorSubject<GetUtteranceResponseModel>(null);
    private utterancesState$ = this.utterancesState.asObservable();

    private errorState = new BehaviorSubject<TranslationCheckModel[]>(null);
    private errorState$ = this.errorState.asObservable();

    setUtterancesState(getUtteranceResponseModel: GetUtteranceResponseModel) {
        this.utterancesState.next(getUtteranceResponseModel);
    }

    getUtterancesState(): Observable<GetUtteranceResponseModel> {
        return this.utterancesState$;
    }

    setErrorState(translationCheck: TranslationCheckModel[]) {
        this.errorState.next(translationCheck);
    }

    getErrorState(): Observable<TranslationCheckModel[]> {
        return this.errorState$;
    }
}
