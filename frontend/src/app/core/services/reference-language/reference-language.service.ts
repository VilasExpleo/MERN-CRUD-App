import { Injectable } from '@angular/core';
import { TranslationRequestService } from '../translation-request/translation-request.service';
import { Observable, combineLatest, map, take } from 'rxjs';
import { TranslationRequestTransformer } from 'src/app/components/dashboard/translation-request/editor-translation-request/components/reference-language/reference-language.transformer';
import { TranslationRequestModel } from 'src/app/components/dashboard/translation-request/editor-translation-request/components/reference-language/reference-language.model';

@Injectable({
    providedIn: 'root',
})
export class ReferenceLanguageService {
    constructor(
        private translationRequestService: TranslationRequestService,
        private translationRequestTransformer: TranslationRequestTransformer
    ) {}

    getModel(): Observable<TranslationRequestModel> {
        const languageStateResponse$ = this.translationRequestService.getLangSelectionState();
        const statisticsStateResponse$ = this.translationRequestService.getStatisticsState();
        const referenceStateResponse$ = this.translationRequestService.getReferenceLanguageState();
        return combineLatest([languageStateResponse$, statisticsStateResponse$, referenceStateResponse$]).pipe(
            take(1),
            map(([languageStateResponse, statisticsStateResponse, referenceStateResponse]) => {
                return this.translationRequestTransformer.transform(
                    languageStateResponse,
                    statisticsStateResponse,
                    referenceStateResponse
                );
            })
        );
    }
}
