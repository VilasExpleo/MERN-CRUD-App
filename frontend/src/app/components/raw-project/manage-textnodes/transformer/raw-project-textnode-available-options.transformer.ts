import { Injectable } from '@angular/core';
import {
    FontModel,
    FontPackageModel,
    LengthCalculationModel,
    VariantModel,
} from '../../../dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { RawProjectTextNodeAvailableOptionModel } from '../raw-project-textnode-available-option.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeAvailableOptionsTransformer {
    transformAvailableFonts(fonts: FontPackageModel[]): RawProjectTextNodeAvailableOptionModel[] {
        return (
            fonts?.map((item) => {
                return {
                    code: item.id,
                    name: item.name,
                };
            }) ?? []
        );
    }

    transformAvailableVariants(variants: VariantModel[]): RawProjectTextNodeAvailableOptionModel[] {
        return (
            variants?.map((item) => {
                return {
                    code: item.id,
                    name: item.name,
                };
            }) ?? []
        );
    }

    transformAvailableLengthCalculations(
        lengthCalculations: LengthCalculationModel[]
    ): RawProjectTextNodeAvailableOptionModel[] {
        return (
            lengthCalculations?.map((item) => {
                return {
                    code: item.id,
                    name: item.name,
                };
            }) ?? []
        );
    }

    transformAvailableLineBreakOptions(lineBreakModes: string[]): RawProjectTextNodeAvailableOptionModel[] {
        return (
            lineBreakModes?.map((item) => {
                return {
                    code: item,
                    name: item,
                };
            }) ?? []
        );
    }

    transformAvailableTextnodeTypes(types: string[]): RawProjectTextNodeAvailableOptionModel[] {
        return (
            types?.map((item) => {
                return {
                    code: item,
                    name: item,
                };
            }) ?? []
        );
    }

    transformFonts(fonts: FontModel[]): RawProjectTextNodeAvailableOptionModel[] {
        return (
            fonts?.map((font) => {
                return {
                    code: font.id,
                    name: font.name,
                };
            }) ?? []
        );
    }
}
