import { Injectable } from '@angular/core';
import { IChecks } from 'src/app/shared/models/check/checks.interface';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import {
    FilRateModel,
    TranslationCheckConfigModel,
    TranslationCheckMessage,
    TranslationCheckModel,
} from 'src/app/shared/models/check/translation-check.model';

@Injectable({
    providedIn: 'root',
})
export class UtilityCheckService implements IChecks {
    validate(translationText: string, config: TranslationCheckConfigModel): TranslationCheckModel[] {
        const utilityCheck: TranslationCheckModel[] = [];
        if (config?.whiteSpaceAtBegin !== TranslationCheckType.None) {
            utilityCheck.push(this.whiteSpaceAtBegin(translationText, config?.whiteSpaceAtBegin) ?? null);
        }
        if (config?.whiteSpaceAtMiddle !== TranslationCheckType.None) {
            utilityCheck.push(this.whiteSpaceAtMiddle(translationText, config?.whiteSpaceAtMiddle) ?? null);
        }
        if (config?.whiteSpaceAtEnd !== TranslationCheckType.None) {
            utilityCheck.push(this.whiteSpaceAtEnd(translationText, config?.whiteSpaceAtEnd) ?? null);
        }
        if (config?.emptyRowAtBegin !== TranslationCheckType.None) {
            utilityCheck.push(this.emptyRowAtBegin(translationText, config?.emptyRowAtBegin ?? null));
        }
        if (config?.emptyRowAtMiddle !== TranslationCheckType.None) {
            utilityCheck.push(this.emptyRowAtMiddle(translationText, config?.emptyRowAtMiddle ?? null));
        }
        if (config?.emptyRowAtEnd !== TranslationCheckType.None) {
            utilityCheck.push(this.emptyRowAtEnd(translationText, config?.emptyRowAtEnd ?? null));
        }
        if (config?.emptyTranslation !== TranslationCheckType.None) {
            utilityCheck.push(this.emptyTranslation(translationText, config?.emptyTranslation ?? null));
        }
        return utilityCheck;
    }

    private whiteSpaceAtBegin(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /^(?=[^\S\n])/.test(text),
            condition,
            TranslationCheckMessage.whiteSpaceAtBegin,
            TranslationCheck.WhiteSpace
        );
    }

    private whiteSpaceAtMiddle(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /[^ \n](?:[ ]{2,}[^ \n])/.test(text),
            condition,
            TranslationCheckMessage.whiteSpaceAtMiddle,
            TranslationCheck.WhiteSpace
        );
    }

    private whiteSpaceAtEnd(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /\S +(?=\n|$)/g.test(text),
            condition,
            TranslationCheckMessage.whiteSpaceAtEnd,
            TranslationCheck.WhiteSpace
        );
    }

    private emptyRowAtBegin(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            this.hasEmptyRowAtStart(text) && !/^\n*$/.test(text),
            condition,
            TranslationCheckMessage.emptyRowAtBegin,
            TranslationCheck.EmptyRow
        );
    }

    private emptyRowAtMiddle(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /(\S)\n\s*\n(\S)/.test(text),
            condition,
            TranslationCheckMessage.emptyRowAtMiddle,
            TranslationCheck.EmptyRow
        );
    }

    private emptyRowAtEnd(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /\n(?:[ \t]*)$/.test(text) && !/^\n*$/.test(text),
            condition,
            TranslationCheckMessage.emptyRowAtEnd,
            TranslationCheck.EmptyRow
        );
    }

    private emptyTranslation(text: string, condition: string): TranslationCheckModel {
        return this.createLog(
            /^$/.test(text),
            condition,
            TranslationCheckMessage.emptyTranslation,
            TranslationCheck.Translation
        );
    }

    fillRate(value: number, config: FilRateModel): TranslationCheckModel {
        return this.createLog(
            value > config?.value,
            config?.type,
            TranslationCheckMessage.fillRate,
            TranslationCheck.Translation
        );
    }

    hasEmptyRowAtStart(text: string): boolean {
        const lines = text.split('\n');
        return /^\s*$/.test(lines[0]);
    }

    private createLog(
        pattern: boolean,
        condition: string,
        message: string,
        type: TranslationCheck
    ): TranslationCheckModel {
        let translationCheckModel: TranslationCheckModel;
        if (pattern) {
            translationCheckModel = {
                type,
                logLevel: condition,
                message: message,
            };
        }
        return translationCheckModel;
    }
}
