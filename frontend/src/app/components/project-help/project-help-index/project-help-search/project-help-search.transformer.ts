import { Injectable } from '@angular/core';
import { ProjectHelpSearchModel } from './project-help-search.model';
import { ProjectHelpSearchResponseModel } from 'src/app/shared/models/project-help/project-hep-search-response.model';

@Injectable({
    providedIn: 'root',
})
export class ProjectHelpSearchTransformer {
    transform(pages: ProjectHelpSearchResponseModel[]): ProjectHelpSearchModel[] {
        return [...pages];
    }
}
