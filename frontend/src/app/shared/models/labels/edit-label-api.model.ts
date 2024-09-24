import { BaseLabelApiModel } from './base-label-api.model';

export interface EditLabelApiModel extends BaseLabelApiModel {
    id: number;
    attachTo: string[];
    role?: string;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
    isBugfix?: boolean;
}
