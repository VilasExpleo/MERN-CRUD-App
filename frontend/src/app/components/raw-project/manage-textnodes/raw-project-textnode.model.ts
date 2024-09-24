import { NodeSubTypeEnum } from '../../../shared/enums/node-sub-type.enum';
import { NodeTypeEnum } from '../../../shared/enums/node-type.enum';

export interface RawProjectTextNodeModel {
    key: number;
    rawProjectId: number;
    parentId: number;
    positionInParent: number;
    nodeSubType: NodeSubTypeEnum;
    nodeType: NodeTypeEnum;
    name: string;
    source?: string;
    variantId: number;
    maxWidth: number;
    maxLength: number;
    maxLines: number;
    lineBreakMode: string;
    fontId: number;
    lengthCalculationId: number;
    editMode: boolean;
    children?: RawProjectTextNodeModel[];
}
