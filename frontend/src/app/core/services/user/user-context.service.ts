import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from './session.service';
const defaultUser = null;
@Injectable({
    providedIn: 'root',
})
export class UserContextService {
    private user$ = new BehaviorSubject(defaultUser);

    constructor(private sessionService: SessionService) {
        const data = this.sessionService.getItem('currentUser');
        if (data) {
            this.user$.next(data);
        }
    }

    getUser() {
        return this.user$;
    }

    setUser(user: any) {
        this.sessionService.setItem('currentUser', user);
        this.user$.next(user);
    }

    logout() {
        this.sessionService.removeItem('currentUser');
        this.user$.next(defaultUser);
    }
}
