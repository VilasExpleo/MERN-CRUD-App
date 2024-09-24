export class RawProjectPropertiesResponseModel {
    id: number;
    description: string;
    projectName: string;
    projectXmlId: string;
    projectType: RawProjectPropertiesProjectTypeResponseModel;
    fontPackages: RawProjectPropertiesFontPackageResponseModel[];
    languages: RawProjectPropertiesLanguageResponseModel[];
    lengthCalculations: RawProjectPropertiesLengthCalculationResponseModel[];
    placeholders: RawProjectPropertiesPlaceholderResponseModel[];
    variants: RawProjectPropertiesVariantResponseModel[];
    fonts: RawProjectPropertiesFontsResponseModel[];
}

export class RawProjectPropertiesProjectTypeResponseModel {
    id: number;
    type: string;
}

export class RawProjectPropertiesFontPackageResponseModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export class RawProjectPropertiesLanguageResponseModel {
    id: number;
    languageCultureName: string;
}

export class RawProjectPropertiesLengthCalculationResponseModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export class RawProjectPropertiesPlaceholderResponseModel {
    id: number;
    symbol: string;
    canDelete: boolean;
}

export class RawProjectPropertiesVariantResponseModel {
    id: number;
    name: string;
    isDefault: boolean;
}

export class RawProjectPropertiesFontsResponseModel {
    id: number;
    name: string;
}
