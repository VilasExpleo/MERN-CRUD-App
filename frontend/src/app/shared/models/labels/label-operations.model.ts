import { BaseLabelApiModel } from '../labels/base-label-api.model';

export interface LabelOperations extends BaseLabelApiModel {
    id: number;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
}
