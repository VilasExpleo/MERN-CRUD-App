import { Injectable } from '@angular/core';
import { HelpCreatorPageRequestModel } from 'src/app/shared/models/help-creator/help-creator-request.model';
import { HelpCenterPagePropertyModel } from 'src/app/shared/models/help-creator/help-creator-response.model';
import { HelpCreatorDashboardPageModel } from './help-creator-dashboard.model';

@Injectable({
    providedIn: 'root',
})
export class HelpCreatorDashboardTransformer {
    transform(
        page: HelpCenterPagePropertyModel,
        pageContent: HelpCreatorPageRequestModel
    ): HelpCreatorDashboardPageModel {
        return {
            ...page,
            ...pageContent,
        };
    }
}
