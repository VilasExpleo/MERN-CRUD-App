import { TreeNode } from 'primeng/api';
import { RawProjectTextNodeModel } from './raw-project-textnode.model';

export interface RowNodeModel {
    level: number;
    node: RawProjectTextNodeModel;
    parent: TreeNode;
    visible: boolean;
}
