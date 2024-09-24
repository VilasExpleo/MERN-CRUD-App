import { Injectable } from '@angular/core';
import { CheckDataModel } from 'src/app/shared/models/check/check-data-model.model';
import { IChecks } from 'src/app/shared/models/check/checks.interface';
import { PunctuationCheck } from 'src/app/shared/models/check/punctuation-check.enum';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';

@Injectable({
    providedIn: 'root',
})
export class PunctuationCheckService implements IChecks {
    validate(translationText: string, _, checkData: CheckDataModel): TranslationCheckModel[] {
        let punctuationCheck: TranslationCheckModel;
        const sourceText = checkData.punctuationCheckData?.sourceString.trim();
        const endCharacterOfText = translationText[translationText.length - 1].trim();
        const endCharacterOfSourceText = (sourceText[sourceText.length - 1] ?? '').trim();
        const sourceEndsWith = this.getEndOfString(sourceText, endCharacterOfSourceText);
        const textEndsWith = this.getEndOfString(translationText, endCharacterOfText);

        if (this.isEndCharacterNotEqual(endCharacterOfText, endCharacterOfSourceText)) {
            if (this.isEndOfTranslationAndSourceSymbol(endCharacterOfText, endCharacterOfSourceText)) {
                punctuationCheck = this.createLog(
                    `Source ends with ${sourceEndsWith}. However, the translation ends without a punctuation mark.`
                );
            }

            if (this.isTranslationAndSourceEndsWithSymbol(endCharacterOfText, endCharacterOfSourceText)) {
                punctuationCheck = this.createLog(
                    `Source ends with ${sourceEndsWith}. However, the translation ends with a ${textEndsWith}.`
                );
            }

            if (this.isTranslationEndsWithSymbolAndSourceNot(endCharacterOfSourceText, endCharacterOfText)) {
                punctuationCheck = this.createLog(
                    `Source ends with no punctuation. However, the translation ends with a ${textEndsWith}.`
                );
            }
        }
        return [punctuationCheck];
    }

    private createLog(message: string): TranslationCheckModel {
        return {
            message,
            logLevel: TranslationCheckType.Warning,
            type: TranslationCheck.Punctuation,
        };
    }

    private getEndOfString(translationText: string, endCharacter: string): string {
        const lastCharacter = this.characterToUtf16(endCharacter);
        switch (!!lastCharacter) {
            case this.isFullStop(lastCharacter):
                return translationText.endsWith('...')
                    ? PunctuationCheck.ellipsisAtEnd
                    : PunctuationCheck.fullStopAtEnd;

            case this.isSpecialFullStop(lastCharacter):
                return PunctuationCheck.fullStopAtEnd;

            case this.isExclamation(lastCharacter):
                return PunctuationCheck.exclamationMarkAtEnd;

            case this.isQuestionMark(lastCharacter):
                return PunctuationCheck.questionMarkAtEnd;

            case this.isInterrobang(lastCharacter):
                return PunctuationCheck.interrobangAtEnd;

            case this.isColon(lastCharacter):
                return PunctuationCheck.colonAtEnd;

            case this.isEllipsis(lastCharacter):
                return PunctuationCheck.ellipsisAtEnd;

            default:
                return endCharacter;
        }
    }

    private characterToUtf16(text: string): string {
        return parseInt(`${this.getCharCode(text)}`, 10)
            .toString(16)
            .padStart(4, '0');
    }

    private getCharCode(character: string): number {
        return character.charCodeAt(0);
    }

    private isEndCharacterNotEqual(endCharacterOfText: string, endCharacterOfSourceText: string): boolean {
        return this.getCharCode(endCharacterOfText) !== this.getCharCode(endCharacterOfSourceText);
    }

    private isCharacterSymbol(character: string): boolean {
        return /^[a-z,]+$/i.test(character);
    }

    private isEndOfTranslationAndSourceSymbol(endCharacterOfText: string, endCharacterOfSourceText: string): boolean {
        return !this.isCharacterSymbol(endCharacterOfSourceText) && this.isCharacterSymbol(endCharacterOfText);
    }

    private isTranslationAndSourceEndsWithSymbol(
        endCharacterOfText: string,
        endCharacterOfSourceText: string
    ): boolean {
        return !this.isCharacterSymbol(endCharacterOfSourceText) && this.isCharacterValid(endCharacterOfText);
    }

    private isTranslationEndsWithSymbolAndSourceNot(
        endCharacterOfSourceText: string,
        endCharacterOfText: string
    ): boolean {
        return this.isCharacterSymbol(endCharacterOfSourceText) && this.isCharacterValid(endCharacterOfText);
    }

    private isCharacterValid(character: string): boolean {
        return !this.isCharacterSymbol(character) && !!character;
    }

    private isFullStop(character: string): boolean {
        return character === '002e';
    }

    private isSpecialFullStop(character: string): boolean {
        return character === '0589' || character === '06d4' || character === '3002' || character === 'ff0e';
    }

    private isExclamation(character: string): boolean {
        return (
            character === '0021' ||
            character === '00a1' ||
            character === 'ff01' ||
            character === '203c' ||
            character === '2762'
        );
    }

    private isQuestionMark(character: string): boolean {
        return (
            character === '003f' ||
            character === '00bf' ||
            character === 'ff1f' ||
            character === '037e' ||
            character === '061f'
        );
    }

    private isInterrobang(character: string): boolean {
        return character === '01c3' || character === '203d' || character === '2048' || character === '2049';
    }

    private isColon(character: string): boolean {
        return character === '003a' || character === 'ff1a';
    }

    private isEllipsis(character: string): boolean {
        return character === '2026';
    }
}
