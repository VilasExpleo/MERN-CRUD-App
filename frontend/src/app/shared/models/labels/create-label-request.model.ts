import { BaseLabelApiModel } from './base-label-api.model';

export interface CreateLabelRequestModel extends BaseLabelApiModel {
    attachTo: string[];
    role?: string;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
    isBugfix?: boolean;
}
