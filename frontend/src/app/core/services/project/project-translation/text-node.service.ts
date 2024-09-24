import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TextNodeRequestModel } from 'src/app/shared/models/text-node/text-node-request.model';
@Injectable({
    providedIn: 'root',
})
export class TextNodeService {
    private textNodeState = new BehaviorSubject<TextNodeRequestModel>(null);
    textNodeState$ = this.textNodeState.asObservable();

    private endSubject$ = new Subject<boolean>();

    setTextNodeState(textNodeState: TextNodeRequestModel) {
        this.textNodeState.next(textNodeState);
    }

    getTextNodeState(): Observable<TextNodeRequestModel> {
        return this.textNodeState$;
    }
}
