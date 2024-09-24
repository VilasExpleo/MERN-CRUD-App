import { Injectable } from '@angular/core';
import { HelpCreatorResponseModel } from 'src/app/shared/models/help-creator/help-creator-response.model';
import { ProjectHelpIndexModel } from './project-help-index.model';

@Injectable({
    providedIn: 'root',
})
export class ProjectHelpIndexTransformer {
    transform(pages: HelpCreatorResponseModel[]): ProjectHelpIndexModel[] {
        return [...pages];
    }
}
