import { Injectable } from '@angular/core';
import { ManageRawProjectModel } from '../../dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { RawProjectManageTextNodesModel } from './raw-project-manage-textnodes.model';
import { RawProjectTextNodeModel } from './raw-project-textnode.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectManageTextNodesTransformer {
    transform(nodes: RawProjectTextNodeModel[], properties: ManageRawProjectModel): RawProjectManageTextNodesModel {
        return {
            nodes,
            properties,
        };
    }
}
