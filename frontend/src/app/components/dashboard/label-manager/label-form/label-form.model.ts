export interface LabelOptionsModel {
    attachTo: string[];
    restrictions: string[];
    icons: string[];
}

export interface LabelFormModel {
    name: string;
    attachTo: string[];
    color?: string;
    restriction?: string;
    restrictionPattern?: string;
    date?: string;
    icon?: string;
    isBugfix?: boolean;
}
