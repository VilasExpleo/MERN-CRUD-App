import { BaseLabelApiModel } from './base-label-api.model';

export interface SourceLabelResponseModel extends BaseLabelApiModel {
    id: number;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
}
