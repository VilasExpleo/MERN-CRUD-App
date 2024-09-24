import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeUpdateResponseTransformer {
    transform(data: number): number {
        return data;
    }
}
