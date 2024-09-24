import { ApiPlaceholderGetResponseModel } from '../../../../shared/models/placeholder/api-placeholder-get-response.model';
import { PlaceholderViewModel } from './placeholder-dialog.model';
import { ApiPlaceholderCreateOrUpdateRequestModel } from '../../../../shared/models/placeholder/api-placeholder-create-or-update-request.model';

export class PlaceholderTransformer {
    static mapToManyViewModels(source: ApiPlaceholderGetResponseModel[]): PlaceholderViewModel[] {
        const target: PlaceholderViewModel[] = [];

        if (source) {
            source.forEach((sourceItem) => {
                const targetItem = this.mapToViewModel(sourceItem);
                target.push(targetItem);
            });
        }

        return target;
    }

    static mapToViewModel(source: ApiPlaceholderGetResponseModel): PlaceholderViewModel {
        return {
            id: +source.id,
            projectId: +source.projectId,
            translationsId: +source.translationsId,
            textNodeId: +source.textNodeId,
            textNodeRowId: source.textNodeRowId,
            dataTypeModelId: +source.datatypeId,
            identifier: source.identifier,
            description: source.description || '',
            longestCaseValue: source.longestCaseValue || '',
            extraLine: source.extraLine ? true : false,
        };
    }

    static mapToApiModel(source: PlaceholderViewModel): ApiPlaceholderCreateOrUpdateRequestModel {
        return {
            id: +source.id,
            projectId: +source.projectId,
            translationsId: +source.translationsId,
            textNodeId: +source.textNodeId,
            textNodeRowId: source.textNodeRowId,
            datatypeId: +source.dataTypeModelId,
            identifier: source.identifier,
            description: source.description,
            longestCaseValue: source.longestCaseValue,
            extraLine: source.extraLine ? true : false,
        };
    }
}
