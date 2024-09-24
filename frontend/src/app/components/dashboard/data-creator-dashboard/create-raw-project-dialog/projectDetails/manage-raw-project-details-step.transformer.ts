import { Injectable } from '@angular/core';
import { ManageRawProjectDetailsStepModel } from './manage-raw-project-details-step.model';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectDetailsStepTransformer {
    transform(response: any[]): ManageRawProjectDetailsStepModel {
        return {
            model: response[0],
            projectTypes: response[1],
        };
    }
}
