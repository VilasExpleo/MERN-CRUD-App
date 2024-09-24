import { CheckDataModel } from './check-data-model.model';
import { TranslationCheckConfigModel, TranslationCheckModel } from './translation-check.model';

export interface IChecks {
    validate(
        translationText: string,
        config?: TranslationCheckConfigModel,
        checkData?: CheckDataModel
    ): TranslationCheckModel[] | void;
}
