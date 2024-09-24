import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectHelpResponseModel } from 'src/app/shared/models/project-help/project-help-response.model';
import { ProjectHelpService } from './project-help.service';

@Injectable()
export class PageContextResolver implements Resolve<ProjectHelpResponseModel> {
    constructor(private projectHelpService: ProjectHelpService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<ProjectHelpResponseModel> {
        return this.projectHelpService.getPageContext(route.queryParamMap.get('link'));
    }
}
