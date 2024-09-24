import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReferenceLanguageService } from 'src/app/core/services/reference-language/reference-language.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { TranslationRequestModel } from './reference-language.model';

@Component({
    selector: 'app-reference-language',
    templateUrl: './reference-language.component.html',
})
export class ReferenceLanguagesComponent implements OnInit {
    @Output()
    navigationEvent = new EventEmitter<number>();

    model: TranslationRequestModel;
    constructor(
        private translationRequestService: TranslationRequestService,
        private referenceLanguageService: ReferenceLanguageService
    ) {}

    ngOnInit(): void {
        this.referenceLanguageService.getModel().subscribe((response) => (this.model = response));
    }

    navigate(index: number): void {
        this.navigationEvent.emit(index);
        this.translationRequestService.setReferenceLanguageState({
            translation_languages: this.model.selectedLanguages,
        });
    }
}
