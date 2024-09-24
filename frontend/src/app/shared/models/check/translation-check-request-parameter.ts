import { CheckDataModel } from './check-data-model.model';
import { TranslationCheckConfigModel } from './translation-check.model';

export interface TranslationCheckRequestParameter {
    translationText: string;
    configModel: TranslationCheckConfigModel;
    checkDataModel?: CheckDataModel;
}
