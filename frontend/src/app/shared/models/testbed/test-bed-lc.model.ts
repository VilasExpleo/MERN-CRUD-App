import { DefaultFontModel, LcDropDownModel } from './test-bed.model';

export interface TestBedLcPayloadModel extends DefaultFontModel {
    lcDetails: LcDropDownModel[];
    bold: boolean;
    font: string;
    italic: boolean;
    texts: string[];
}
