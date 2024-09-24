import { Injectable } from '@angular/core';
import { StringUtilityService } from 'src/app/core/services/string-utility.service';
import { RangeModel } from '../models/rte-translation-construction.model';
import { RTETranslationPlaceholderModel } from '../models/rte-translation-placeholder.model';

@Injectable({
    providedIn: 'root',
})
export class RTETranslationPlaceholderService {
    constructor(private readonly stringUtilityService: StringUtilityService) {}
    getRegexStringForIdentifyingBadFormatting(placeholderIdentifiers: RTETranslationPlaceholderModel[]): string {
        const uniquePlaceholders = this.stringUtilityService.removeDuplicatesFromArray(
            placeholderIdentifiers?.map((el) => el.identifier.slice(0, -1)) ?? []
        );

        if (uniquePlaceholders.length === 0) {
            return this.defaultRegex().source;
        } else {
            const placeholderRegexStr = uniquePlaceholders
                .map((el) => el.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            return this.defaultRegex().source + '|' + placeholderRegexStr;
        }
    }

    placeholderTooltip(placeholderIdentifiers: RTETranslationPlaceholderModel[], linkText: string) {
        const longestCaseValue = placeholderIdentifiers.find(
            (placeholder) => placeholder.identifier === linkText
        ).longestCaseValue;

        if (this.stringUtilityService.isNotNullAndUndefined(longestCaseValue) && longestCaseValue !== '') {
            return longestCaseValue;
        } else {
            return 'Please enter the longest case value';
        }
    }

    placeholderRange(placeholders: RTETranslationPlaceholderModel[], originalText: string): RangeModel | null {
        const longestValueUpdatedPlaceholder = placeholders.find(
            (placeholder: RTETranslationPlaceholderModel) => placeholder.isLongestValueUpdated
        );

        if (longestValueUpdatedPlaceholder) {
            const index = originalText.indexOf(longestValueUpdatedPlaceholder.identifier);
            return { index, length: longestValueUpdatedPlaceholder.identifier.length };
        }

        return null;
    }

    private defaultRegex(): RegExp {
        return /[¶⏎](?!\n)|(?<![¶⏎])\n/;
    }
}
