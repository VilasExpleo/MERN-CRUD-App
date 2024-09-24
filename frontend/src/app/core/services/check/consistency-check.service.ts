import { Injectable } from '@angular/core';
import { CheckDataModel } from 'src/app/shared/models/check/check-data-model.model';
import { IChecks } from 'src/app/shared/models/check/checks.interface';
import { TranslationCheck, TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckMessage, TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';

@Injectable({
    providedIn: 'root',
})
export class ConsistencyCheckService implements IChecks {
    validate(translationText: string, config, consistencyCheckData: CheckDataModel): TranslationCheckModel[] {
        const consistencyCheck: TranslationCheckModel[] = [];
        const translationTexts = consistencyCheckData?.consistencyCheckData?.TranslationTexts;
        if (translationTexts.length > 0 && !translationTexts.includes(translationText)) {
            consistencyCheck.push(
                this.createConsistencyLog(
                    TranslationCheckType.Warning,
                    TranslationCheckMessage.consistency,
                    TranslationCheck.Consistency
                )
            );
        }
        return consistencyCheck;
    }

    private createConsistencyLog(condition: string, message: string, type: TranslationCheck): TranslationCheckModel {
        return {
            type,
            logLevel: condition,
            message: message,
        };
    }
}
