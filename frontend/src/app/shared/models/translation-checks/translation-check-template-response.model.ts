import { TranslationChecksResponseModel } from './translation-checks.response.model';
export interface TranslationChecksTemplateResponseModel {
    id: number;
    name: string;
    configuration: TranslationChecksResponseModel;
}
