import { Injectable } from '@angular/core';
import { TestBedResponseModel } from 'src/app/shared/models/testbed/test-bed.model';
import { TestBedModel } from './test-bed.model';

@Injectable({
    providedIn: 'root',
})
export class TestBedTransformer {
    transform(config: TestBedResponseModel): TestBedModel {
        return {
            defaultFont: config?.defaultFont,
            columns: [{ header: 'Sample Text', field: 'sampleText' }],
            rows: config?.defaultTexts?.map((text, i: number) => {
                return { sampleText: text, id: i };
            }),
        };
    }
}
