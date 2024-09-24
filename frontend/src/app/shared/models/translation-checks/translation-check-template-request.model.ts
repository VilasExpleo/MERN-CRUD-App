import { TranslationChecksResponseModel } from './translation-checks.response.model';
export interface TranslationChecksTemplateRequestModel {
    name: string;
    userId: number;
    configuration: TranslationChecksResponseModel;
}
