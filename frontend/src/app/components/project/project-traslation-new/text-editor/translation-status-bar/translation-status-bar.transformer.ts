import { Injectable } from '@angular/core';
import { TextNodeStatus } from 'src/Enumerations';
import { TranslationStatusBarModel } from './translation-status-bar.model';
@Injectable({
    providedIn: 'root',
})
export class TranslationStatusBarTransformer {
    transform(response): TranslationStatusBarModel {
        return {
            proofReadStatus: TextNodeStatus[response?.proofread_status],
            proofReaderComment: response?.proofread_comment,
            reviewerStatus: TextNodeStatus[response?.review_status],
            screenReviewStatus: TextNodeStatus[response?.screen_review_status],
            reviewerComment: response?.review_comment,
            screenReviewComment: response?.screen_review_comment,
            languageParentId: response?.languageParentId,
            icon: this.getPostponeTextNodeProperty('icon', response),
            date: this.getPostponeTextNodeProperty('date', response),
            name: this.getPostponeTextNodeProperty('name', response),
        };
    }

    private getPostponeTextNodeProperty(key: string, response) {
        return (
            this.getPostponeTextNode(response?.labels)?.[key] ||
            this.getPostponeTextNode(response?.languageWiseLabels)?.[key]
        );
    }

    private getPostponeTextNode(labels) {
        return labels?.find((label) => label.date);
    }
}
