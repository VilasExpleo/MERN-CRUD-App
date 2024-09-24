import { Pipe, PipeTransform } from '@angular/core';
import { PlaceholderDataTypeEnum } from '../../components/project/project-traslation-new/placeholder-detail-dialog/placeholder-data-type.enum';

@Pipe({
    name: 'placeholderDataTypePipe',
})
export class PlaceholderDatatypePipe implements PipeTransform {
    transform(id: number) {
        let label = id.toString();
        switch (id) {
            case PlaceholderDataTypeEnum.FixedText:
                label = 'Fixed Text';
                break;
            case PlaceholderDataTypeEnum.DynamicText:
                label = 'Dynamic Text';
                break;
            case PlaceholderDataTypeEnum.Integer:
                label = 'Number Integer';
                break;
            case PlaceholderDataTypeEnum.Double:
                label = 'Number Decimal';
                break;
        }
        return label;
    }
}
