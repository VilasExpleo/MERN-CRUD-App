import { Injectable } from '@angular/core';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { Tab } from 'src/Enumerations';
import { ScreenshotTransformer } from 'src/app/components/project/project-traslation-new/references/screenshots/screenshot.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ApiService } from '../../api.service';
import { TabService } from './tab.service';
import { TextNodeService } from './text-node.service';
@Injectable({
    providedIn: 'root',
})
export class ScreenshotService {
    countReferences;
    constructor(
        private textNodeService: TextNodeService,
        private tabService: TabService,
        private apiService: ApiService,
        private screenshotTransformer: ScreenshotTransformer
    ) {}

    getTextNode() {
        return this.textNodeService.getTextNodeState();
    }

    getScreenshots() {
        const textNodeState$ = this.textNodeService.getTextNodeState();
        const tab$ = this.tabService.getState();
        return combineLatest([textNodeState$, tab$]).pipe(
            filter(([selectedTextNode, selectedTab]) => Tab.References === selectedTab && !!selectedTextNode),
            switchMap(([selectedTextNode, selectedTab]) => {
                selectedTab;
                return this.apiService
                    .postTypeRequest('screenshot', selectedTextNode)
                    .pipe(map((response: ApiBaseResponseModel) => this.screenshotTransformer.transform(response)));
            })
        );
    }
}
