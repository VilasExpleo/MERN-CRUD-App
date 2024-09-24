import { Observable } from 'rxjs';

export abstract class LogPublisher {
    location!: string;
    abstract log(): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}

export class LogConsole extends LogPublisher {
    log(): Observable<boolean> {
        throw new Error('Method not implemented.');
    }
    clear(): Observable<boolean> {
        throw new Error('Method not implemented.');
    }
}
