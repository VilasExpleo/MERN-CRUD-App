import { Injectable } from '@angular/core';
import { LabelCheckModel } from 'src/app/shared/models/check/label-check-model.model';
import { TranslationCheck } from 'src/app/shared/models/check/transaltion-check.enum';
import { IChecks } from '../../../shared/models/check/checks.interface';
import { TranslationCheckModel } from '../../../shared/models/check/translation-check.model';
import { LabelCheckCondition } from 'src/app/shared/models/check/label-check-condition.enum';
@Injectable({
    providedIn: 'root',
})
export class LabelCheckService implements IChecks {
    validate(translationText, config, checkData): TranslationCheckModel[] {
        const translationCheckModels: TranslationCheckModel[] = [];
        checkData?.labelCheckData.forEach((checkData: LabelCheckModel) => {
            translationCheckModels.push(this.validateLabel(checkData, translationText));
        });

        return translationCheckModels;
    }

    validateLabel(labelCheckModel: LabelCheckModel, translationText: string): TranslationCheckModel {
        switch (labelCheckModel.condition) {
            case LabelCheckCondition.UpperCase: {
                return translationText !== translationText.toUpperCase() ? this.checkUpperCase() : null;
            }
            case LabelCheckCondition.LowerCase: {
                return translationText !== translationText.toLowerCase() ? this.checkLowerCase() : null;
            }
            default: {
                return !new RegExp(labelCheckModel.value).test(translationText)
                    ? this.checkRegex(labelCheckModel.value)
                    : null;
            }
        }
    }

    private checkUpperCase(): TranslationCheckModel {
        return {
            logLevel: 'Warning',
            message: 'Only uppercase letters are allowed in the translation.',
            type: TranslationCheck.Labels,
        };
    }

    private checkLowerCase(): TranslationCheckModel {
        return {
            logLevel: 'Warning',
            message: 'Only lowercase letters are allowed in the translation.',
            type: TranslationCheck.Labels,
        };
    }

    private checkRegex(regexExpression: string): TranslationCheckModel {
        return {
            logLevel: 'Warning',
            message: `Allowed regex in translated text '${regexExpression}'`,
            type: TranslationCheck.Regex,
        };
    }
}
