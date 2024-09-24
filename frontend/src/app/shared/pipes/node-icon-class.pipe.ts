import { Pipe, PipeTransform } from '@angular/core';
import { GroupnodeType, TextnodeType } from '../../../Enumerations';
import { NodeSubTypeEnum } from '../enums/node-sub-type.enum';
import { NodeTypeEnum } from '../enums/node-type.enum';

@Pipe({
    name: 'nodeIconClassPipe',
})
export class NodeIconClassPipe implements PipeTransform {
    transform(nodeType: NodeTypeEnum, nodeSubType: NodeSubTypeEnum): string {
        let iconClass = '';

        switch (nodeType) {
            case NodeTypeEnum.Group:
                if (GroupnodeType[nodeSubType]) {
                    iconClass = GroupnodeType[nodeSubType];
                }
                break;
            case NodeTypeEnum.Textnode:
                if (TextnodeType[nodeSubType]) {
                    iconClass = TextnodeType[nodeSubType];
                }
                break;
        }

        return iconClass;
    }
}
