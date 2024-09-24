import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CountResponseModel } from 'src/app/shared/models/tabs/count-response.model';

@Injectable({
    providedIn: 'root',
})
export class TabService {
    private selectedTabIndex = new BehaviorSubject<number>(0);
    selectedTabIndex$ = this.selectedTabIndex.asObservable();

    private countState = new BehaviorSubject<CountResponseModel>({ references: 0 });
    countState$ = this.countState.asObservable();

    private countCommentState = new BehaviorSubject<number>(0);
    countCommentState$ = this.countCommentState.asObservable();

    setState(selectedTabViewIndex) {
        this.selectedTabIndex.next(selectedTabViewIndex);
    }

    getState(): Observable<number> {
        return this.selectedTabIndex$;
    }

    setCountState(state: CountResponseModel) {
        this.countState.next(state);
    }

    getCountState() {
        return this.countState$;
    }

    //TODO: Discuss with backend to send all the counts with text node selection
    // Remove the below state and use the above state for all counts
    setCountCommentState(state) {
        this.countCommentState.next(state);
    }

    getCountCommentState() {
        return this.countCommentState$;
    }
}
