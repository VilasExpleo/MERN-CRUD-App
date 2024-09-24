import { Injectable } from '@angular/core';
import { DeltaStatic, RangeStatic } from 'quill';
import { StringUtilityService } from 'src/app/core/services/string-utility.service';
import { ConfigurationModel, RTETranslationConfigurationModel } from '../models/rte-translation-configuration.model';
import {
    RTETranslationConstructionModel,
    RangeModel,
    SubStringRangeModel,
} from '../models/rte-translation-construction.model';
import { RTETranslationPlaceholderModel } from '../models/rte-translation-placeholder.model';
import { RTETranslationPlaceholderService } from './rte-translation-placeholder.service';

@Injectable({
    providedIn: 'root',
})
export class RTETranslationConstructionService {
    constructor(
        private readonly stringUtilityService: StringUtilityService,
        private readonly rteTranslationPlaceholderService: RTETranslationPlaceholderService
    ) {}

    constructTranslation(
        delta: DeltaStatic,
        originalText: string,
        userSelection: RangeStatic | null,
        placeholderIdentifiers: RTETranslationPlaceholderModel[],
        standardTextTransformations: RTETranslationConfigurationModel
    ): RTETranslationConstructionModel {
        // Find the indices of the metacharacters ¶ and • to color blue
        const insertedSubstrings = this.getNewlyInsertedSubstrings(delta, originalText, placeholderIdentifiers);

        // Ranges(array containing index and length) to color • in blue in translation area
        const blueRanges = this.recordPatternMatchesInSubstrings(
            insertedSubstrings,
            originalText,
            this.getNamedRegexForTextTransformations(standardTextTransformations),
            this.mapStandardTextTransformation(standardTextTransformations, (transformation) => {
                return {
                    lengthOfReplacementStr:
                        transformation.replacementString === null ? -1 : transformation.replacementString.length,
                    recordReplacement: transformation.colorBlue,
                };
            })
        );

        //Ranges(array containing index and length) to insert the text as link in translation area
        const placeholderRanges = this.recordPatternMatchesInSubstrings(
            insertedSubstrings,
            originalText,
            this.getNamedRegexForTextTransformations(standardTextTransformations),
            this.mapStandardTextTransformation(standardTextTransformations, (transformation) => {
                return {
                    lengthOfReplacementStr:
                        transformation.replacementString === null ? -1 : transformation.replacementString.length,
                    recordReplacement: transformation.name === 'placeholder',
                };
            })
        );

        // Replace spaces with •, replace newlines without ¶ with a full pair, and remove ¶ without newlines
        this.applyTransformationsToSubstringsAndCursor(
            insertedSubstrings,
            originalText,
            userSelection,
            this.mapStandardTextTransformation(standardTextTransformations, (transformation) => {
                return {
                    regExp: transformation.unnamedRegex,
                    replacementStr: transformation.replacementString,
                    advanceCursor: transformation.advanceCursor,
                };
            })
        );

        const modifiedText = insertedSubstrings.reduce((currentStr, currentSubstrObj) => {
            return this.stringUtilityService.replaceSubstringInString(
                currentStr,
                currentSubstrObj.index,
                currentSubstrObj.length,
                currentSubstrObj.substring
            );
        }, originalText);

        // TODO: This regex could be simplified by omitting first 2 groups
        const toHighlight = this.stringUtilityService.findPatternMatches(/(^•+)|(••+)|(•+(?=[¶⏎]$))/gm, modifiedText);

        return {
            insertedSubstrings,
            blueRanges,
            placeholderRanges,
            toHighlight,
            originalText,
            modifiedText,
            userSelection,
        };
    }

    mapStandardTextTransformation(
        standardTextTransformations: RTETranslationConfigurationModel,
        fn: (input: ConfigurationModel) => any
    ): any {
        return Object.fromEntries(
            Object.keys(standardTextTransformations).map((key) => {
                const transformation = standardTextTransformations[key];
                return [key, fn(transformation)];
            })
        );
    }

    /**
     * Retrieves substrings of the editor's complete text that the user has just entered as well as text that
     * matches a regular expression.
     *
     * @param delta - The Quill editor's delta object, which contains information about recently edited text
     * @param include - A regular expression that is used to include text otherwise not entered by the user
     * @param placeholderIdentifiers - Placeholder identifiers in the entered text
     * @returns An array of objects that indicate each substring's position, length, and content,
     * whereby length = substring.length
     */
    private getNewlyInsertedSubstrings(
        delta: DeltaStatic,
        currentText: string,
        placeholderIdentifiers: RTETranslationPlaceholderModel[]
    ): { index: number; length: number; substring: string }[] {
        let currentTextIndex = 0;
        const res = [];

        for (const op of delta.ops) {
            if (op.retain && typeof op.retain === 'number') {
                currentTextIndex += op.retain;
            } else if (op.insert && typeof op.insert === 'string') {
                const insertedStr = op.insert;
                res.push({ index: currentTextIndex, length: insertedStr.length, substring: insertedStr });
                currentTextIndex += insertedStr.length;
            }
        }

        this.mergePatternMatchesWithOtherSubstrings(placeholderIdentifiers, currentText, res);
        return this.mergeAdjacentSubstrings(res);
    }

    /**
     * Locates where the named regular expression matches the substrings of the complete text and returns the positions of
     * these matches, taking the length of the string that will replace these matches into account. Note: The length and
     * substring.length properties of each element in the substring array must be equal.
     *
     * @param substringArr - Array containing the substrings of the complete text, the indices at which they occur,
     * and their lengths, whereby for each element of this array: length = substring.length
     * @param completeText - The complete text which the substrings occur in
     * @param regExp - The regular expression to search for, which may use the entire text for context,
     * but only matches text located within the substrings, and whose named clauses may only be disjoint
     * @param replacementRules - The rules, indexed by the names of the groups in the regular expression,
     * by which index offsets in the returned matches are calculated
     * @returns An array of matches in the supplied substrings that take the provided replacement rules into account
     */
    recordPatternMatchesInSubstrings(
        substringArr: SubStringRangeModel[],
        completeText: string,
        regExp: RegExp,
        replacementRules: { [groupName: string]: { lengthOfReplacementStr: number; recordReplacement: boolean } }
    ): RangeModel[] {
        const occurrences: RangeModel[] = [];
        let offset = 0;
        for (const substringObj of substringArr) {
            regExp.lastIndex = substringObj.index;
            const searchWindowEndIndex = substringObj.index + substringObj.length;
            let match = regExp.exec(completeText);
            while (match && match.index <= searchWindowEndIndex) {
                const foundGroupNames = Object.keys(match.groups).filter((name) => match.groups[name] !== undefined);
                const replacementRule = replacementRules[foundGroupNames[0]];
                const lengthOfReplacement =
                    replacementRule.lengthOfReplacementStr === -1
                        ? match.groups[foundGroupNames[0]].length
                        : replacementRule.lengthOfReplacementStr;
                if (
                    match.index + match.groups[foundGroupNames[0]].length <= searchWindowEndIndex &&
                    replacementRule.recordReplacement
                ) {
                    const matchIndexAfterReplacements = match.index + offset;
                    occurrences.push({
                        index: matchIndexAfterReplacements,
                        length: lengthOfReplacement,
                    });
                }
                offset += lengthOfReplacement - match.groups[foundGroupNames[0]].length;
                match = regExp.exec(completeText);
            }
        }
        return occurrences;
    }

    private getNamedRegexForTextTransformations(standardTextTransformations: RTETranslationConfigurationModel): RegExp {
        let source = '';
        let flags = '';
        for (const transformation of Object.values(standardTextTransformations)) {
            source += (source === '' ? '' : '|') + transformation.namedRegex.source;
            flags = (flags + transformation.namedRegex.flags)
                .split('')
                .sort()
                .join('')
                .replace(/(.)(?=.*\1)/g, '');
        }
        return new RegExp(source, flags);
    }

    /**
     * Adjusts substrings in the substring array in accordance with the transformations from the transformation array.
     * Also adjusts the cursor to move with the changing text. Does not update the length property of a substring object.
     * The substrings are assumed to be present in the complete text.
     *
     * @param substringArr - Array containing the substrings of the complete text, the indices at which they occur,
     * and an unassessed length parameter
     * @param completeText - The complete text which the substrings occur in
     * @param cursorSelection - The cursor position to adjust
     * @param transformationArr - An array of disjoint transformations that dictates how the substrings are adjusted
     */
    private applyTransformationsToSubstringsAndCursor(
        substringArr: { index: number; length: number; substring: string }[],
        completeText: string,
        cursorSelection: RangeStatic,
        transformationArr: { [key: string]: { regExp: RegExp; replacementStr: string; advanceCursor: boolean } }
    ): void {
        let pt1 = cursorSelection === null ? 0 : cursorSelection.index;
        let pt2 = cursorSelection === null ? 0 : cursorSelection.index + cursorSelection.length;
        for (const transformation of Object.values(transformationArr)) {
            let totalOffset = 0;
            for (const substringObj of substringArr) {
                substringObj.index += totalOffset;
                transformation.regExp.lastIndex = substringObj.index;
                let match = transformation.regExp.exec(completeText);
                while (match && match.index + match[0].length <= substringObj.index + substringObj.substring.length) {
                    const replacementStr =
                        transformation.replacementStr === null ? match[0] : transformation.replacementStr;
                    const offset = replacementStr.length - match[0].length;
                    pt1 = this.calculateNewCursorValue(
                        pt1,
                        match.index,
                        offset,
                        replacementStr.length,
                        transformation.advanceCursor
                    );
                    pt2 = this.calculateNewCursorValue(
                        pt2,
                        match.index,
                        offset,
                        replacementStr.length,
                        transformation.advanceCursor
                    );
                    totalOffset += offset;
                    completeText = this.stringUtilityService.replaceSubstringInString(
                        completeText,
                        match.index,
                        match[0].length,
                        replacementStr
                    );
                    substringObj.substring = this.stringUtilityService.replaceSubstringInString(
                        substringObj.substring,
                        match.index - substringObj.index,
                        match[0].length,
                        replacementStr
                    );
                    transformation.regExp.lastIndex = match.index + replacementStr.length;
                    match = transformation.regExp.exec(completeText);
                }
            }
        }
        if (cursorSelection !== null) {
            cursorSelection.index = pt1;
            cursorSelection.length = pt2 - pt1;
        }
    }

    /**
     * Locates where the regular expression matches the given text, combines these with the array of substrings
     * if they overlap, and creates new entries otherwise.
     *
     * @param regExp - The regular expression to search for
     * @param text - The text that is traversed with the regular expression
     * @param res - The array of existing substrings that is adjusted and / or added to
     */
    private mergePatternMatchesWithOtherSubstrings(
        placeholderIdentifiers: RTETranslationPlaceholderModel[],
        text: string,
        res: { index: number; length: number; substring: string }[]
    ) {
        const substringsToAdd = [];
        const regExp = new RegExp(
            this.rteTranslationPlaceholderService.getRegexStringForIdentifyingBadFormatting(placeholderIdentifiers),
            'g'
        );
        let match = regExp.exec(text);
        while (match !== null) {
            let overlap = false;
            let currentSubstringIndex = 0;
            while (
                currentSubstringIndex < res.length &&
                !(overlap = this.indicesOverlap(
                    match.index,
                    match[0].length,
                    res[currentSubstringIndex].index,
                    res[currentSubstringIndex].length
                )) &&
                res[currentSubstringIndex].index < match.index
            ) {
                currentSubstringIndex++;
            }
            if (currentSubstringIndex >= res.length || !overlap) {
                substringsToAdd.push({ index: match.index, length: match[0].length, substring: match[0] });
            } else {
                res[currentSubstringIndex].index = Math.min(res[currentSubstringIndex].index, match.index);
                res[currentSubstringIndex].length =
                    Math.max(
                        res[currentSubstringIndex].index + res[currentSubstringIndex].length,
                        match.index + match[0].length
                    ) - res[currentSubstringIndex].index;
                res[currentSubstringIndex].substring = text.slice(
                    res[currentSubstringIndex].index,
                    res[currentSubstringIndex].index + res[currentSubstringIndex].length
                );
            }
            match = regExp.exec(text);
        }
        res.push(...substringsToAdd);
    }

    private mergeAdjacentSubstrings(arr: SubStringRangeModel[]): SubStringRangeModel[] {
        arr.sort((a, b) => a.index - b.index);
        for (let i = 0; i < arr.length - 1; ) {
            const fst = arr[i];
            const snd = arr[i + 1];
            if (fst.index + fst.length === snd.index) {
                arr.shift();
                arr[i] = {
                    index: fst.index,
                    length: fst.length + snd.length,
                    substring: fst.substring + snd.substring,
                };
            } else {
                i++;
            }
        }
        return arr;
    }

    private calculateNewCursorValue(
        cursorIndex: number,
        matchIndex: number,
        totalOffset: number,
        replacementLength: number,
        advanceCursor: boolean
    ): number {
        if (matchIndex <= cursorIndex) {
            if (advanceCursor && matchIndex + replacementLength > cursorIndex) {
                return matchIndex + replacementLength;
            } else {
                return cursorIndex + totalOffset;
            }
        } else {
            return cursorIndex;
        }
    }

    private indicesOverlap(index1: number, length1: number, index2: number, length2: number): boolean {
        if (index1 < index2) {
            return index1 + length1 > index2 && length2 !== 0;
        } else if (index2 < index1) {
            return index2 + length2 > index1 && length1 !== 0;
        } else {
            return length1 !== 0 && length2 !== 0;
        }
    }
}
