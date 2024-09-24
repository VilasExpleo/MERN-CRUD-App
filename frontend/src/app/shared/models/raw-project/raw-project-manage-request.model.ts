export interface RawProjectManageRequestModel {
    id?: number;
    projectXmlId: string;
    projectName: string;
    description: string;
    projectTypeId: number;
    variants: RawProjectManageRequestVariantModel[];
    languages: RawProjectManageRequestLanguageModel[];
    placeholders: RawProjectManageRequestPlaceholderModel[];
    fontPackages: RawProjectManageRequestFontPackageModel[];
    lengthCalculations: RawProjectManageRequestLengthCalculationModel[];
}

export interface RawProjectManageRequestLanguageModel {
    id: number;
    languageCode: string;
}

export interface RawProjectManageRequestVariantModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export interface RawProjectManageRequestFontPackageModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export interface RawProjectManageRequestLengthCalculationModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export interface RawProjectManageRequestPlaceholderModel {
    id?: number;
    symbol: string;
    canDelete: boolean;
}
