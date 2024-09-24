import { Injectable } from '@angular/core';
import { RawProjectCheckUniquePropertiesRequestModel } from '../../shared/models/raw-project/raw-project-check-unique-properties-request.model';
import { RawProjectCheckUniquePropertiesValidatorModel } from './raw-project-check-unique-properties-validator.model';
import { RawProjectCheckUniquePropertiesResponseModel } from '../../shared/models/raw-project/raw-project-check-unique-properties-response.model';
import { RawProjectCheckUniquePropertiesValidationResultModel } from './raw-project-check-unique-properties-validation-result.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectCheckUniquePropertiesTransformer {
    transformValidatorToRequestModel(
        viewModel: RawProjectCheckUniquePropertiesValidatorModel
    ): RawProjectCheckUniquePropertiesRequestModel {
        return {
            projectXmlId: viewModel.projectXmlId,
            projectName: viewModel.projectName,
            excludeProjectId: viewModel.projectId,
        };
    }

    transformManyResponseToValidationResultModel(
        data: RawProjectCheckUniquePropertiesResponseModel[]
    ): RawProjectCheckUniquePropertiesValidationResultModel[] {
        return (
            data?.map((entry) => {
                return this.transformResponseToValidationResultModel(entry);
            }) ?? []
        );
    }

    transformResponseToValidationResultModel(
        response: RawProjectCheckUniquePropertiesResponseModel
    ): RawProjectCheckUniquePropertiesValidationResultModel {
        return {
            property: response.property,
            isInUse: response.isInUse,
        };
    }
}
