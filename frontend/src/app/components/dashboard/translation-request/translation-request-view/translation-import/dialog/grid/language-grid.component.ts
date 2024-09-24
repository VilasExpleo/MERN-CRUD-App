import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { LanguageGridModel, LanguageModel } from './language-grid.model';
import { LanguageGridTransformer } from './language-grid.transformer';

@Component({
    selector: 'app-language-grid',
    templateUrl: './language-grid.component.html',
})
export class LanguageGridComponent implements OnInit {
    languages: LanguageGridModel[];
    selectedLanguages = [];
    isAllLanguagesSelected = false;

    @Input()
    checklist: ChecklistModel[];

    @Output()
    languageSelectionEvent = new EventEmitter();

    @Output()
    showChecklistEvent = new EventEmitter();

    constructor(private transformer: LanguageGridTransformer, private eventBus: NgEventBus) {}

    ngOnInit(): void {
        this.languages = this.transformer.transform();
    }

    setSelectedLanguage() {
        this.languageSelectionEvent.emit(this.selectedLanguages);
    }
    toggleLanguageSelection() {
        this.isAllLanguagesSelected = !this.isAllLanguagesSelected;
        if (this.isAllLanguagesSelected) {
            this.selectedLanguages = this.languages;
        } else {
            this.selectedLanguages = [];
        }
        this.languageSelectionEvent.emit(this.selectedLanguages);
    }

    showChecklist(language: LanguageModel) {
        this.showChecklistEvent.emit(language);
    }
}
