import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
    OrderReviewStateModel,
    ReviewerLanguageModel,
    ViewTypeOption,
} from '../../../../../core/services/order-review/order-review.model';
import { OrderReviewService } from '../../../../../core/services/order-review/order-review.service';

@Component({
    selector: 'app-order-review-language',
    templateUrl: './language.component.html',
})
export class OrderReviewLanguageComponent implements OnInit {
    @Input()
    headerText = 'Select the languages for which you want to submit a review order';

    @Input()
    sourceLanguageText = 'Source Language';

    @Input()
    reviewTypeText = 'Select Review Type';

    @Input()
    sourceHeaderText = 'Available Languages';

    @Input()
    targetHeaderText = 'Selected Languages';

    @Output()
    navigationEvent = new EventEmitter<number>();

    dropDownLanguages: ReviewerLanguageModel[];
    model: OrderReviewStateModel;
    selectedReviewType: ViewTypeOption;

    constructor(private orderReviewService: OrderReviewService) {}

    ngOnInit(): void {
        this.orderReviewService.getOrderReviewLanguageState().subscribe((response) => {
            this.model = response;
            this.dropDownLanguages = [response.supplierLanguage, response.editorLanguage, ...response.sourceLanguages];
            this.selectedReviewType = this.model?.selectedReviewType;
        });
    }

    changeEditorLanguage(selectedLanguage: ReviewerLanguageModel) {
        if (selectedLanguage.languageId !== this.model.supplierLanguage.languageId) {
            this.updateModelForEditorForeignLanguages(selectedLanguage);
        } else {
            this.updateModelForSupplierLanguage(selectedLanguage);
        }
    }

    private updateModelForEditorForeignLanguages(selectedLanguage: ReviewerLanguageModel) {
        const isPreviousSelectionWasSupplier = this.model.selectedLanguage.languageId === 0;

        if (isPreviousSelectionWasSupplier) {
            this.model.availableLanguages = [this.model.editorLanguage, ...this.model.sourceLanguages];
            this.model.targetLanguages = [];
        } else {
            this.model.availableLanguages = [this.model.selectedLanguage, ...this.model.availableLanguages];
            this.model.targetLanguages = this.getFilteredLanguages([...this.model.targetLanguages], selectedLanguage);
        }

        this.model.availableLanguages = this.getFilteredLanguages([...this.model.availableLanguages], selectedLanguage);
        this.model.selectedLanguage = selectedLanguage;
    }

    private updateModelForSupplierLanguage(selectedLanguage: ReviewerLanguageModel) {
        this.model.availableLanguages = [this.model.editorLanguage];
        this.model.targetLanguages = [];
        this.model.selectedLanguage = selectedLanguage;
    }

    navigate(index: number) {
        this.orderReviewService.setOrderReviewState({
            ...this.model,
            availableLanguages: this.model.availableLanguages,
            selectedLanguage: this.model.selectedLanguage,
            targetLanguages: this.model.targetLanguages,
            selectedReviewType: this.selectedReviewType,
        });
        this.navigationEvent.emit(index);
    }

    private getFilteredLanguages(languages: ReviewerLanguageModel[], selectedLanguage: ReviewerLanguageModel) {
        return languages.filter((language) => language.languageCode !== selectedLanguage.languageCode);
    }

    isNextDisabled(): boolean {
        return this.model.targetLanguages.length !== 0 && !!this.selectedReviewType;
    }
}
