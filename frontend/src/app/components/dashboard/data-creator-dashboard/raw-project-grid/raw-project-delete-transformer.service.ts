import { Injectable } from '@angular/core';
import { ResponseStatusEnum } from '../../../../../Enumerations';

@Injectable({
    providedIn: 'root',
})
export class RawProjectDeleteTransformer {
    transform(responseStatus: ResponseStatusEnum): boolean {
        return responseStatus === ResponseStatusEnum.OK;
    }
}
