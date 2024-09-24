import { Injectable } from '@angular/core';
import {
    RawProjectPropertiesFontPackageResponseModel,
    RawProjectPropertiesFontsResponseModel,
    RawProjectPropertiesLanguageResponseModel,
    RawProjectPropertiesLengthCalculationResponseModel,
    RawProjectPropertiesPlaceholderResponseModel,
    RawProjectPropertiesProjectTypeResponseModel,
    RawProjectPropertiesResponseModel,
    RawProjectPropertiesVariantResponseModel,
} from '../../shared/models/raw-project/raw-project-properties-response.model';
import {
    FontModel,
    FontPackageModel,
    LanguageModel,
    LengthCalculationModel,
    ManageRawProjectModel,
    PlaceholderModel,
    ProjectType,
    VariantModel,
} from '../dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectPropertiesTransformer {
    transform(data: RawProjectPropertiesResponseModel): ManageRawProjectModel {
        if (!data) {
            return null;
        }

        return {
            id: data.id,
            projectXmlId: data.projectXmlId,
            projectName: data.projectName,
            projectType: this.transformProjectType(data.projectType),
            description: data.description,
            fontPackages: this.transformManyFontPackages(data.fontPackages),
            languages: this.transformManyLanguages(data.languages),
            lengthCalculations: this.transformManyLengthCalculations(data.lengthCalculations),
            placeholders: this.transformManyPlaceholders(data.placeholders),
            variants: this.transformManyVariants(data.variants),
            fonts: this.transformFonts(data.fonts),
            fontPackage: this.transformManyFontPackages(data.fontPackages)[0],
        };
    }

    transformProjectType(projectType: RawProjectPropertiesProjectTypeResponseModel): ProjectType {
        return projectType
            ? {
                  id: projectType.id,
                  type: projectType.type,
              }
            : null;
    }

    transformManyFontPackages(dtoList: RawProjectPropertiesFontPackageResponseModel[]): FontPackageModel[] {
        return (
            dtoList?.map((entry) => {
                return this.transformFontPackage(entry);
            }) ?? []
        );
    }

    transformFontPackage(fontPackage: RawProjectPropertiesFontPackageResponseModel): FontPackageModel {
        return {
            id: fontPackage.id,
            name: fontPackage.name,
            isDefault: fontPackage.isDefault,
        };
    }

    transformManyLanguages(dtoList: RawProjectPropertiesLanguageResponseModel[]): LanguageModel[] {
        return (
            dtoList?.map((entry) => {
                return this.transformLanguage(entry);
            }) ?? []
        );
    }

    transformLanguage(dto: RawProjectPropertiesLanguageResponseModel): LanguageModel {
        return {
            languageId: dto.id,
            languageCode: dto.languageCultureName,
        };
    }

    transformManyLengthCalculations(
        dtoList: RawProjectPropertiesLengthCalculationResponseModel[]
    ): LengthCalculationModel[] {
        return (
            dtoList?.map((entry) => {
                return this.transformLengthCalculation(entry);
            }) ?? []
        );
    }

    transformLengthCalculation(lc: RawProjectPropertiesLengthCalculationResponseModel): LengthCalculationModel {
        return {
            id: lc.id,
            name: lc.name,
            isDefault: lc.isDefault,
        };
    }

    transformManyPlaceholders(dtoList: RawProjectPropertiesPlaceholderResponseModel[]): PlaceholderModel[] {
        return (
            dtoList?.map((entry) => {
                return this.transformlaceholder(entry);
            }) ?? []
        );
    }

    transformlaceholder(placeholder: RawProjectPropertiesPlaceholderResponseModel): PlaceholderModel {
        return {
            id: placeholder.id,
            symbol: placeholder.symbol,
            canDelete: placeholder.canDelete,
        };
    }

    transformManyVariants(dtoList: RawProjectPropertiesVariantResponseModel[]): VariantModel[] {
        return (
            dtoList?.map((entry) => {
                return this.transformVariant(entry);
            }) ?? []
        );
    }

    transformVariant(variant: RawProjectPropertiesVariantResponseModel): VariantModel {
        return {
            id: variant.id,
            name: variant.name,
            isDefault: variant.isDefault,
        };
    }

    transformFonts(fonts: RawProjectPropertiesFontsResponseModel[]): FontModel[] {
        return (
            fonts?.map((font) => {
                return this.transformFont(font);
            }) ?? []
        );
    }

    transformFont(font: RawProjectPropertiesFontsResponseModel): FontModel {
        return {
            id: font.id,
            name: font.name,
        };
    }
}
