import { UseCaseEnum } from '../../../../shared/enums/use-case.enum';

export interface ManageRawProjectStateModel {
    rawProject: ManageRawProjectModel;
    availableOptions: ManageRawProjectAvailableOptionsModel;
    useCase: UseCaseEnum;
}

export interface ManageRawProjectModel {
    id: number;
    projectXmlId: string;
    projectName: string;
    projectType: ProjectType;
    description: string;
    variants: VariantModel[];
    languages: LanguageModel[];
    placeholders: PlaceholderModel[];
    fontPackages: FontPackageModel[];
    lengthCalculations: LengthCalculationModel[];
    fonts: FontModel[];
    fontPackage: FontPackageModel;
}

export interface ManageRawProjectAvailableOptionsModel {
    projectTypes: ProjectType[];
    languages: LanguageModel[];
    fontPackages: FontPackageModel[];
    lengthCalculations: LengthCalculationModel[];
    placeholders: PlaceholderModel[];
}

export interface LanguageModel {
    languageCode: string;
    languageId: number;
}

export interface ProjectType {
    id?: number;
    type: string;
}

export interface VariantModel {
    id?: number;
    name: string;
    isDefault: boolean;
}

export interface FontPackageModel {
    id?: number;
    name: string;
    isDefault: boolean;
}

export interface LengthCalculationModel {
    id?: number;
    name: string;
    isDefault: boolean;
}

export interface PlaceholderModel {
    id?: number;
    symbol: string;
    canDelete: boolean;
}

export interface FontModel {
    id?: number;
    name: string;
}
