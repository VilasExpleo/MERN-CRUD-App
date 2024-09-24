import { Injectable } from '@angular/core';
import { ManageRawProjectLanguageStepModel } from './manage-raw-project-language-step.model';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectLanguageStepTransformer {
    transform(response: any[]): ManageRawProjectLanguageStepModel {
        return {
            model: response[0],
            languages: response[1],
        };
    }
}
