import { Injectable } from '@angular/core';
import {
    RawProjectManageRequestModel,
    RawProjectManageRequestLanguageModel,
    RawProjectManageRequestVariantModel,
    RawProjectManageRequestFontPackageModel,
    RawProjectManageRequestLengthCalculationModel,
    RawProjectManageRequestPlaceholderModel,
} from '../../../../shared/models/raw-project/raw-project-manage-request.model';
import {
    FontPackageModel,
    LanguageModel,
    LengthCalculationModel,
    VariantModel,
    PlaceholderModel,
    ManageRawProjectModel,
} from './manage-raw-project-state.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectManageRequestTransformer {
    transform(viewModel: ManageRawProjectModel): RawProjectManageRequestModel {
        return {
            projectXmlId: viewModel.projectXmlId,
            projectName: viewModel.projectName,
            projectTypeId: viewModel.projectType.id,
            description: viewModel.description,
            variants: this.transformManyVariants(viewModel.variants),
            languages: this.transformManyLanguages(viewModel.languages),
            fontPackages: this.transformManyFontPackage(viewModel.fontPackages),
            lengthCalculations: this.transformManyLengthCalculation(viewModel.lengthCalculations),
            placeholders: this.transformManyPlaceholders(viewModel.placeholders),
        };
    }

    transformManyVariants(variants: VariantModel[]): RawProjectManageRequestVariantModel[] {
        if (variants) {
            return variants.map((entry) => {
                return this.transformVariant(entry);
            });
        }
        return [];
    }

    transformVariant(variant: VariantModel): RawProjectManageRequestVariantModel {
        return {
            id: variant.id,
            name: variant.name,
            isDefault: variant.isDefault,
        };
    }

    transformManyLanguages(languages: LanguageModel[]): RawProjectManageRequestLanguageModel[] {
        return (
            languages?.map((entry) => {
                return this.transformLanguage(entry);
            }) ?? []
        );
    }

    transformLanguage(language: LanguageModel): RawProjectManageRequestLanguageModel {
        return {
            id: language.languageId,
            languageCode: language.languageCode,
        };
    }

    transformManyFontPackage(fontPackages: FontPackageModel[]): RawProjectManageRequestFontPackageModel[] {
        return (
            fontPackages?.map((entry) => {
                return this.transformFontPackage(entry);
            }) ?? []
        );
    }

    transformFontPackage(fontPackage: FontPackageModel): RawProjectManageRequestFontPackageModel {
        return {
            id: fontPackage.id,
            name: fontPackage.name,
            isDefault: fontPackage.isDefault,
        };
    }

    transformManyLengthCalculation(
        lengthCalculations: LengthCalculationModel[]
    ): RawProjectManageRequestLengthCalculationModel[] {
        return (
            lengthCalculations?.map((entry) => {
                return this.transformLengthCalculation(entry);
            }) ?? []
        );
    }

    transformLengthCalculation(
        lengthCalculation: LengthCalculationModel
    ): RawProjectManageRequestLengthCalculationModel {
        return {
            id: lengthCalculation.id,
            name: lengthCalculation.name,
            isDefault: lengthCalculation.isDefault,
        };
    }

    transformManyPlaceholders(placeholders: PlaceholderModel[]): RawProjectManageRequestPlaceholderModel[] {
        return (
            placeholders?.map((entry) => {
                return this.transformPlaceholder(entry);
            }) ?? []
        );
    }

    transformPlaceholder(placeholder: PlaceholderModel): RawProjectManageRequestPlaceholderModel {
        return {
            id: placeholder.id,
            symbol: placeholder.symbol,
            canDelete: placeholder.canDelete,
        };
    }
}
