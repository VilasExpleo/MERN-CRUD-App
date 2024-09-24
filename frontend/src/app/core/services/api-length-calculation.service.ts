import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CalculateWordLineBreakPayload, ReslovedFont } from '../../shared/models/project/projectTranslate';

@Injectable({
    providedIn: 'root',
})
export class ApiLengthCalculationService {
    baseUrl = `${environment.lcUrl}`;
    constructor(private httpClient: HttpClient) {}
    lengthCalculationRequest(url: string, payload: CalculateWordLineBreakPayload) {
        return this.httpClient.post(this.baseUrl + url, payload);
    }
    postTypeRequest(url: string, payload: any) {
        return this.httpClient.post(this.baseUrl + url, payload);
    }
    checkFontIsUnresloved(url: string, payload: CalculateWordLineBreakPayload) {
        return this.httpClient.post<ReslovedFont>(this.baseUrl + url, payload);
    }
}
