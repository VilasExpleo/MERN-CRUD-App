import { ConsistencyCheckModel } from './consistency-check-model.model';
import { LabelCheckModel } from './label-check-model.model';
import { PunctuationCheckModel } from './punctuation-check.model';

export interface CheckDataModel {
    labelCheckData?: LabelCheckModel[];
    consistencyCheckData?: ConsistencyCheckModel;
    punctuationCheckData?: PunctuationCheckModel;
}
