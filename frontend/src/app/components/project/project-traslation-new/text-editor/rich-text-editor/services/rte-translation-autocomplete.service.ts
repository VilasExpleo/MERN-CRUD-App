import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { SpellcheckService } from 'src/app/core/services/project/project-translation/spellcheck/spellcheck.service';
import { RTETranslationColorEnum, RTETranslationSuggestionsTypeEnum } from '../enum/rich-text-editor.enum';
import { RTETranslationMentionItemModel } from '../models/rte-translation-mention-item.model';

@Injectable({
    providedIn: 'root',
})
export class RTETranslationAutocompleteService {
    constructor(private readonly spellcheckService: SpellcheckService) {}

    getMentionConfig() {
        return {
            dataAttributes: ['value', 'color', 'type'],
            blotName: 'styled-mention',
            allowedChars: /^[\p{L}\s]*$/u,
            mentionDenotationChars: ['•', ' ', '', '¶⏎', '¶', '⏎', '\n'],
            positioningStrategy: 'fixed',
            onSelect: this.insertItem.bind(this),
            source: this.handleMentionSource.bind(this),
            renderItem: this.renderMentionItem.bind(this),
        };
    }

    private handleMentionSource(searchTerm: string, renderList) {
        this.spellcheckService
            .spellcheckSuggestions()
            .pipe(take(1))
            .subscribe((suggestions: string[]) => {
                const suggestionsItem: RTETranslationMentionItemModel[] = this.createMentionItems(suggestions);
                renderList(suggestionsItem, searchTerm);
            });
    }

    private createMentionItems(suggestions: string[]): RTETranslationMentionItemModel[] {
        if (!suggestions) {
            return [];
        }

        const values: RTETranslationMentionItemModel[] = suggestions.map((suggestion) => ({
            value: suggestion,
            type: RTETranslationSuggestionsTypeEnum.text,
        }));

        if (suggestions.length !== 0) {
            values.push({
                value: 'Add to custom dictionary <i class="pi pi-plus right-0"></i>',
                color: RTETranslationColorEnum.BLUE,
                type: RTETranslationSuggestionsTypeEnum.button,
            });
        }

        return values;
    }
    private insertItem(item: RTETranslationMentionItemModel) {
        item.type === RTETranslationSuggestionsTypeEnum.text && this.spellcheckService.insertText(item.value);
        item?.type === RTETranslationSuggestionsTypeEnum.button && this.spellcheckService.addWordToDictionary();
    }

    private renderMentionItem(item: RTETranslationMentionItemModel) {
        const element = document.createElement('span');
        element.classList.add('custom-mention-item');
        element.innerHTML = item.value;
        element.style.color = item?.color;
        element.style.display = 'inline-block';
        element.style.width = '100%';
        return element;
    }

    getWordAtIndex(index: number, quillLength: number, words: string[]): string {
        if (index >= 0 && index < quillLength) {
            let currentIndex = 0;

            for (const word of words) {
                const wordLength = word.length + 1; // Include the space between words
                if (currentIndex + wordLength > index) {
                    return word;
                }
                currentIndex += wordLength;
            }
        }
        return '';
    }
}
