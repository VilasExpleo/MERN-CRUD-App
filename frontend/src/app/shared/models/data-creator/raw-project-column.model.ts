import { RawProjectTextNodeAvailableOptionModel } from 'src/app/components/raw-project/manage-textnodes/raw-project-textnode-available-option.model';
import { InputTypeEnum } from '../../enums/input-type.enum';

export interface RawProjectColumnModel {
    header: string;
    inputConfig: InputConfigModel;
}

export interface InputConfigModel {
    field: string;
    // TODO: Confirm with Lars, if we can add the 'None' to InputTypeEnum
    type: InputTypeEnum | 'None';
    optionValue?: string;
    optionLabel?: string;
    options?: RawProjectTextNodeAvailableOptionModel[];
}
