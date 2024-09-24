import { Injectable } from '@angular/core';
import { TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';

@Injectable({
    providedIn: 'root',
})
export class ErrorLogsTransformer {
    transform(translationCheckModel: TranslationCheckModel[]): TranslationCheckModel[] {
        return translationCheckModel
            .filter((translationCheckModel) => !!translationCheckModel)
            .map((errorLog) => {
                return {
                    ...errorLog,
                    logLevel: this.getLogLevels(errorLog.logLevel),
                };
            });
    }

    private getLogLevels(logLevel: string) {
        switch (logLevel) {
            case TranslationCheckType.Warning:
                return 'warn';
            case TranslationCheckType.Error:
                return 'error';
            default:
                return logLevel;
        }
    }
}
