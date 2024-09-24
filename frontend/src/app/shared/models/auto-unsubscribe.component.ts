import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export abstract class AutoUnsubscribeComponent implements OnDestroy {
    private subscriptions: Subscription = new Subscription();

    constructor() {
        // prevent memory leak when override destroy hook
        const original = this.ngOnDestroy;
        this.ngOnDestroy = () => {
            this._ngOnDestroy();
            original.apply(this);
        };
    }

    protected set subs(sub: Subscription) {
        this.subscriptions.add(sub);
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    private _ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
