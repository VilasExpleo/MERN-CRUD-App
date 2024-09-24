import { Injectable } from '@angular/core';
import { LabelModel } from './label.model';
import { LabelResponseModel } from 'src/app/shared/models/labels/label-response.model';

@Injectable({
    providedIn: 'root',
})
export class LabelTransformer {
    private external = 'External';
    private self = 'Self Created';

    transform(labels: LabelResponseModel[]): LabelModel[] {
        return labels.map((label: LabelResponseModel) => ({
            ...label,
            attachTo: label.attachTo.join(','),
            type: label.isExternal ? this.external : this.self,
            bugFix: label.isBugfix ? 'Yes' : 'No',
        }));
    }
}
