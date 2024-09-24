import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StringUtilityService {
    replaceSubstringInString(str: string, index: number, length: number, replacement: string): string {
        const prefix = str.slice(0, index);
        const suffix = str.slice(index + length);
        return prefix + replacement + suffix;
    }

    charAtIndexIs(str: string, char: string, index: number): boolean {
        if (index < 0 || index >= str.length) {
            return false;
        } else {
            return str.charAt(index) === char;
        }
    }

    findPatternMatches(regExp: RegExp, str: string): { index: number; length: number }[] {
        const res = [];
        let match = regExp.exec(str);
        while (match !== null) {
            res.push({ index: match.index, length: match[0].length });
            match = regExp.exec(str);
        }
        return res;
    }

    removeDuplicatesFromArray(inputArray: string[]): string[] {
        return Array.from(new Set(inputArray));
    }

    isNotNullAndUndefined(value?: string | null): boolean {
        return value !== null && value !== undefined;
    }
}
