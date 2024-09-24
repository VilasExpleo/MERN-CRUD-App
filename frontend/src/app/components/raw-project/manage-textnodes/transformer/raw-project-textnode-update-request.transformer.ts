import { Injectable } from '@angular/core';
import { RawProjectTextNodeUpdateRequestModel } from 'src/app/shared/models/raw-project/raw-project-textnode.model';
import { RawProjectTextNodeModel } from '../raw-project-textnode.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeUpdateRequestTransformer {
    transformMany(data: RawProjectTextNodeModel[]): RawProjectTextNodeUpdateRequestModel[] {
        return (
            data?.map((item) => {
                return this.transform(item);
            }) ?? []
        );
    }

    transform(viewModel: RawProjectTextNodeModel): RawProjectTextNodeUpdateRequestModel {
        return {
            id: viewModel.key,
            name: viewModel.name,
            source: viewModel.source,
            variantId: viewModel.variantId,
            maxWidth: viewModel.maxWidth,
            maxLength: viewModel.maxLength,
            maxLines: viewModel.maxLength,
            lineBreakMode: viewModel.lineBreakMode,
            fontId: viewModel.fontId,
            rawProjectId: viewModel.rawProjectId,
            parentId: viewModel.parentId,
            positionInParent: viewModel.positionInParent,
            nodeSubType: viewModel.nodeSubType,
            nodeType: viewModel.nodeType,
            lengthCalculationId: viewModel.lengthCalculationId,
            children: this.transformMany(viewModel.children),
        };
    }
}
