import { Injectable } from '@angular/core';
import {
    HelpCenterPagePropertyFlagModel,
    HelpCreatorPageModel,
    HelpCreatorResponseModel,
} from 'src/app/shared/models/help-creator/help-creator-response.model';
import { HelpIndexModel } from './help-index.model';

@Injectable({
    providedIn: 'root',
})
export class HelpIndexTransformer {
    transform(pages: HelpCreatorResponseModel[]): HelpIndexModel[] {
        return this.mapProperties(pages);
    }

    private mapProperties(pages: HelpCreatorResponseModel[]): HelpCreatorResponseModel[] {
        return pages.map((page: HelpCreatorResponseModel, i: number) => {
            return {
                data: {
                    ...page.data,
                    ...this.getProperties(false, true, i + 1),
                },
                children:
                    page?.children.map((child: HelpCreatorPageModel, j: number) => {
                        return {
                            data: {
                                ...child.data,
                                ...this.getProperties(true, true, +`${j + 1}${i + 1}`),
                            },
                        };
                    }) ?? [],
            };
        });
    }

    private getProperties(isChild: boolean, isSaved: boolean, id: number): HelpCenterPagePropertyFlagModel {
        return {
            isChild,
            isSaved,
            id,
        };
    }
}
