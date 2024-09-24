import { Injectable } from '@angular/core';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ScreenshotModel } from './screenshot.model';
@Injectable({
    providedIn: 'root',
})
export class ScreenshotTransformer {
    transform(response: ApiBaseResponseModel): ScreenshotModel[] {
        return this.getScreenshots(response);
    }
    getScreenshots(response: ApiBaseResponseModel): ScreenshotModel[] {
        if (response?.data && response?.status === ResponseStatusEnum.OK) {
            return [...response.data];
        } else {
            return [{ dbTextNodeId: 0, viewName: '', variantName: '', errorMessage: response.message }];
        }
    }
}
