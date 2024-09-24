import { NodeSubTypeEnum } from '../../enums/node-sub-type.enum';
import { NodeTypeEnum } from '../../enums/node-type.enum';

export interface RawProjectTextNodeModel {
    id: number;
    rawProjectId: number;
    parentId: number;
    positionInParent: number;
    nodeSubType: NodeSubTypeEnum;
    nodeType: NodeTypeEnum;
    name: string;
    source: string;
    variantId: number;
    maxWidth: number;
    maxLength: number;
    maxLines: number;
    lineBreakMode: string;
    fontId: number;
    lengthCalculationId: number;
    children?: RawProjectTextNodeModel[];
}

export type RawProjectTextNodeCreateRequestModel = RawProjectTextNodeModel;
export type RawProjectTextNodeListResponseModel = RawProjectTextNodeModel;
export type RawProjectTextNodeUpdateRequestModel = RawProjectTextNodeModel;
