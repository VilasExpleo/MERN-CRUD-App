import { ManageRawProjectModel } from '../../dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { RawProjectTextNodeModel } from './raw-project-textnode.model';

export interface RawProjectManageTextNodesModel {
    nodes: RawProjectTextNodeModel[];
    properties: ManageRawProjectModel;
}
