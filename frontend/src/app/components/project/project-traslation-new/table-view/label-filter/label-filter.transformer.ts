import { Injectable } from '@angular/core';
import { LabelOperations } from 'src/app/shared/models/labels/label-operations.model';
import { SourceLabelResponseModel } from 'src/app/shared/models/labels/source-label-reponse.model';

@Injectable({
    providedIn: 'root',
})
export class LabelFilterTransformer {
    transform(response: SourceLabelResponseModel[]): LabelOperations[] {
        return response ? [...response] : [];
    }
}
