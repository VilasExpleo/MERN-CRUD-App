import { Component, Input } from '@angular/core';
import { BaseLabelApiModel } from '../../models/labels/base-label-api.model';

@Component({
    selector: 'app-label-icon',
    templateUrl: './label-icon.component.html',
})
export class LabelIconComponent {
    @Input()
    labels: BaseLabelApiModel[];
    get labelNames(): string {
        if (this.labels) {
            const [, ...labelList] = this.labels;
            return labelList.map((label: BaseLabelApiModel) => label.name).join(', ');
        } else {
            return '';
        }
    }

    get label(): BaseLabelApiModel {
        return this.labels?.[0];
    }
}
