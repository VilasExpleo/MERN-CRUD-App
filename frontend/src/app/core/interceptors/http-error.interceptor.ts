import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) {}
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            retry({
                count: 1,
                delay: (_, retryCount) => timer(retryCount * 1000),
            }),
            catchError((error: HttpErrorResponse) => {
                this.injector.get(ErrorHandler).handleError(error);
                return throwError(() => error);
            })
        );
    }
}
