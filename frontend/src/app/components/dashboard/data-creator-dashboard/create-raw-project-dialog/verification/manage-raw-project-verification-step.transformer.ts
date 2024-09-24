import { Injectable } from '@angular/core';
import { ManageRawProjectVerificationStepModel } from './manage-raw-project-verification-step.model';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectVerificationStepTransformer {
    transform(response: any[]): ManageRawProjectVerificationStepModel {
        return {
            model: response[0],
            fontPackages: response[1],
            lengthCalculations: response[2],
        };
    }
}
