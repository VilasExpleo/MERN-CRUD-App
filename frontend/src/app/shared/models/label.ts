export interface Label {
    id?: number;
    isRestrictedLabel?: boolean;
    labelColor?: string;
    labelDate?: any;
    labelGroupId?: number;
    labelSymbolId?: number;
    name?: string;
    restrictionPattern?: string;
    restrictionToUppercase?: boolean;
    restrictionToLowercase?: boolean;
    labelAttachTypeId?: number;
    bugfix?: boolean;
    givenBySupplier?: boolean;
    projectLanguageIds?: number[];
    projectLanguages?: any[];
    checked?: boolean;
}
