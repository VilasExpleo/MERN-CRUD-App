/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    baseUrl = `${environment.apiUrl}`;
    menuMode = 'static';
    accessToken;

    constructor(private httpClient: HttpClient) {}

    login(url: string, payload) {
        return this.httpClient.post(this.baseUrl + url, payload);
    }

    getRequest<T>(url): Observable<T> {
        return this.httpClient.get<T>(this.baseUrl + url);
    }

    getTypeRequest(url, payload) {
        return this.httpClient.get(this.baseUrl + url, payload);
    }

    postTypeDownloadRequest(url: string, payload: any, type?: any) {
        return this.httpClient.post(this.baseUrl + url, payload, type);
    }
    postTypeRequest(url: string, payload: any) {
        return this.httpClient.post(this.baseUrl + url, payload);
    }

    postTypeRequestTyped<T>(url: string, payload: any): Observable<T> {
        return this.httpClient.post<T>(this.baseUrl + url, payload);
    }

    patchTypeRequest(url: any, payload: any) {
        return this.httpClient.patch(this.baseUrl + url, payload);
    }

    putTypeRequest(url: any, payload: any) {
        return this.httpClient.put(this.baseUrl + url, payload);
    }

    deleteTypeRequest(url, payload) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
            body: payload,
        };
        return this.httpClient.delete(this.baseUrl + url, options).pipe(
            map((res) => {
                return res;
            })
        );
    }

    downloadRequest(url: string): Observable<Blob> {
        return this.httpClient.get(this.baseUrl + url, { responseType: 'blob' });
    }

    highPriorityPostTypeRequest(url: string, payload: any) {
        const options = {
            headers: new HttpHeaders({
                'X-Priority': 'high',
            }),
        };
        return this.httpClient.post(this.baseUrl + url, payload, options);
    }

    abortUploadPostTypeRequest(url: string, payload: any) {
        const options = {
            headers: new HttpHeaders({
                'x-cancel-upload': 'true',
            }),
        };
        return this.httpClient.post(this.baseUrl + url, payload, options);
    }

    deleteRequest(url) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }),
        };
        return this.httpClient.delete(this.baseUrl + url, options).pipe(
            map((res) => {
                return res;
            })
        );
    }

    downloadRequestFromOtherServer(url: string): Observable<Blob> {
        return this.httpClient.get(url, { responseType: 'blob' });
    }
}
