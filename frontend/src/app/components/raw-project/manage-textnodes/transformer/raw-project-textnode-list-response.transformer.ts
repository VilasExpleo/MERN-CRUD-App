import { Injectable } from '@angular/core';
import { RawProjectTextNodeListResponseModel } from 'src/app/shared/models/raw-project/raw-project-textnode.model';
import { RawProjectTextNodeModel } from '../raw-project-textnode.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeListResponseTransformer {
    transform(data: RawProjectTextNodeListResponseModel[]): RawProjectTextNodeModel[] {
        return (
            data?.map((item) => {
                return this.transformSingle(item);
            }) ?? []
        );
    }

    transformSingle(item: RawProjectTextNodeListResponseModel): RawProjectTextNodeModel {
        return {
            key: item.id,
            rawProjectId: item.rawProjectId,
            parentId: item.parentId,
            positionInParent: item.positionInParent,
            nodeSubType: item.nodeSubType,
            nodeType: item.nodeType,
            name: item.name,
            source: item.source,
            variantId: item.variantId,
            maxWidth: item.maxWidth,
            maxLength: item.maxLength,
            maxLines: item.maxLines,
            lengthCalculationId: item.lengthCalculationId,
            lineBreakMode: item.lineBreakMode,
            fontId: item.fontId,
            editMode: false,
            children: this.transform(item.children),
        };
    }
}
