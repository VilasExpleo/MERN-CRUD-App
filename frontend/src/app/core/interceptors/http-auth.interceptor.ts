import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../services/storage/local-storage.service';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
    constructor(private localStorageService: LocalStorageService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.localStorageService.get('token');
        let clonedRequest = request;

        if (token) {
            clonedRequest = request.clone({
                headers: request.headers.set('Authorization', 'bearer ' + token),
            });
        }

        return next.handle(clonedRequest);
    }
}
