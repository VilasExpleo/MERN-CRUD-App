import { Component } from '@angular/core';
import { TranslationTextModel } from '../decompress/decompress-details.model';

@Component({
    selector: 'app-translate',
    templateUrl: './translate.component.html',
})
export class TranslateComponent {
    translationTexts: TranslationTextModel[] = [];
    selectedText: TranslationTextModel;

    addText(text: string) {
        this.translationTexts.push({ text: text });
    }
}
