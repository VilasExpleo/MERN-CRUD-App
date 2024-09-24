import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeCreateResponseTransformer {
    transform(data: number): number {
        return data;
    }
}
