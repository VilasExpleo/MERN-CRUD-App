import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseError } from 'src/app/shared/models/response-error';
import { Response } from '../../shared/models/response';

@Injectable({
    providedIn: 'root',
})
export class RestService {
    base = '';

    constructor(public http: HttpClient) {}

    apiGet<T>(
        path = '',
        params?: { [param: string]: string | string[] },
        options?,
        processErrors?: boolean
    ): Observable<T> | any {
        const request = this.http.get<Response<T>>(this.addBaseUrl(path), {
            headers: options && options.headers,
            params: { ...(options && options.params), ...params },
            responseType: options && options.responseType,
            observe: 'body',
        });
        if (processErrors) {
            return this.processErrors<T>(request);
        }
        return request as any;
    }

    apiPost<T>(path: string, body: any | null = null, options?: any, processErrors?: boolean): Observable<T> | any {
        const request = this.http.post<Response<T>>(this.addBaseUrl(path), body, {
            headers: options && options.headers,
            params: options && options.params,
            responseType: options && options.responseType,
            observe: 'body',
        });
        if (processErrors) {
            return this.processErrors<T>(request);
        }
        return request as any;
    }

    apiPut<T>(path: string, body: any | null = null, options?: any, processErrors?: boolean): Observable<T> | any {
        const request = this.http.put<Response<T>>(this.addBaseUrl(path), body, {
            headers: options && options.headers,
            params: options && options.params,
            responseType: options && options.responseType,
            observe: 'body',
        });
        if (processErrors) {
            return this.processErrors<T>(request);
        }
        return request as any;
    }

    apiDelete<T>(path: string, options?: any, processErrors?: boolean): Observable<T> | any {
        const request = this.http.request<Response<T>>('DELETE', this.addBaseUrl(path), {
            headers: options && options.headers,
            params: options && options.params,
            responseType: options && options.responseType,
            body: options && options.body,
            observe: 'body',
        });

        if (processErrors) {
            return this.processErrors<T>(request);
        }
        return request as any;
    }

    apiPostBlob(path: string, body: any | null = null, options?: any): Observable<Blob> {
        const requestOptions = options ? { ...options, responseType: 'blob' } : { responseType: 'blob' };
        return this.apiPost<Blob>(path, body, requestOptions).catch((err: HttpErrorResponse) =>
            this.processHttpErrorResponse(err)
        );
    }

    private addBaseUrl(url: string): string {
        return url.startsWith('/') ? this.base + url : `${this.base}/${url}`;
    }

    private processErrors<T>(request: Observable<Response<T>>): Observable<T> {
        return request.pipe(
            // catchError((err: HttpErrorResponse) => this.processHttpErrorResponse(err)),
            map((res: Response<T>) => {
                if (res.success) {
                    return res.response;
                }
                throw this.getErrorMessage(res.errors);
            })
        );
    }

    private processHttpErrorResponse(err: HttpErrorResponse): Observable<string> {
        const error: Response<any> = err.error;
        if (error.errors) {
            throw this.getErrorMessage(error.errors);
        }
        throw (error as any).message || 'Unknown error';
    }

    private getErrorMessage(errors: ResponseError[]): string {
        return errors.map((err) => err.message).join(' ');
    }
}
