import { ReviewerSanityCheckModel } from './../../../../shared/models/sanity-check.model';
import { SanityChecksService } from './../../../../core/services/sanity-checks/sanity-checks.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RequestModel, TargetLanguageRequestModel } from './../../../../shared/components/grid/grid.model';
@Component({
    selector: 'app-finish-review-request',
    templateUrl: './finish-review-request.component.html',
})
export class FinishReviewRequestComponent {
    @Input()
    isVisible;

    @Input()
    headerText = 'Finish Review';

    @Input()
    sanityMessageModel = {
        dateText: 'Due Date:',
        sourceLanguageText: 'Source Language:',
        targetLanguageText: 'Target Language:',
        textNodesText: 'Text Nodes:',
    };

    @Output()
    finishRequestEvent = new EventEmitter<void>();

    @Output()
    closeFinishOrderDialogEvent = new EventEmitter<void>();

    @Input()
    targetLanguageRequest: TargetLanguageRequestModel;

    @Input()
    selectedReviewRequest: RequestModel;

    constructor(private sanityChecksService: SanityChecksService) {}

    completeReviewOrder() {
        this.finishRequestEvent.emit();
    }

    getSanityMessage() {
        const reviewerSanityModel: ReviewerSanityCheckModel = {
            reviewProgress: this.targetLanguageRequest?.progress,
        };
        return this.sanityChecksService.getSanityMessage({
            reviewer: reviewerSanityModel,
            dueDate: this.selectedReviewRequest?.dueDate,
        });
    }

    closeDialog() {
        this.closeFinishOrderDialogEvent.emit();
    }
}
