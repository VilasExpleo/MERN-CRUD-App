import { DefaultFontModel, WebsocketContentModel } from 'src/app/shared/models/testbed/test-bed.model';

export interface TestBedModel {
    columns: TestBedColumnModel[];
    rows?: TestBedRowsModel[];
    defaultFont?: DefaultFontModel;
}

export interface TestBedColumnModel {
    field: string;
    header: string;
}
export interface TestBedRowsModel extends WebsocketContentModel {
    sampleText: string;
    id: number;
    customText?: boolean;
}
