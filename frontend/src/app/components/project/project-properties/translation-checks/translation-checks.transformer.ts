import { Injectable } from '@angular/core';
import { TranslationChecksConfigurationModel, TranslationChecksTemplateModel } from './translation-checks.model';

@Injectable({
    providedIn: 'root',
})
export class TranslationChecksTransformer {
    transform(
        templates: TranslationChecksTemplateModel[],
        configuration: TranslationChecksConfigurationModel
    ): TranslationChecksTemplateModel[] {
        const projectConfiguration = { name: '', configuration };
        return [projectConfiguration, ...templates];
    }
}
