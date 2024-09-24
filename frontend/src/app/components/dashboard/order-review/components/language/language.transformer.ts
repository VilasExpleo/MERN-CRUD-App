import { Injectable } from '@angular/core';
import { OrderReviewStateModel, ViewTypeOption } from '../../../../../core/services/order-review/order-review.model';

@Injectable({
    providedIn: 'root',
})
export class OrderReviewLanguageTransformer {
    transform(state: OrderReviewStateModel, reviewTypes: ViewTypeOption[]): OrderReviewStateModel {
        return {
            ...state,
            selectedLanguage: state?.selectedLanguage ?? state.editorLanguage,
            availableLanguages: state?.availableLanguages ?? [...state.sourceLanguages],
            targetLanguages: state?.targetLanguages ?? [],
            reviewTypes: reviewTypes ?? [],
            selectedReviewType: state?.selectedReviewType,
        };
    }
}
