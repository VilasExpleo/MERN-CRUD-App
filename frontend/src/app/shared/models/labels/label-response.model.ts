import { BaseLabelApiModel } from './base-label-api.model';

export interface LabelResponseModel extends BaseLabelApiModel {
    id: number;
    attachTo: string[];
    isExternal?: boolean;
    usedCount?: number;
    role?: string;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
    isBugfix?: boolean;
}
