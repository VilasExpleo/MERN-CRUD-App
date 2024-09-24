/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UploadxmlService {
    constructor(private apiService: ApiService, private http: HttpClient) {}
    uploadXml(method: any, dataJson: any) {
        return this.apiService.postTypeRequest('new-xml', dataJson);
    }
    validateXml(method: any, dataJson: any) {
        return this.apiService.postTypeRequest('validate-xml', dataJson);
    }
    checkProjectName(projectname: any): Observable<Object> {
        return this.apiService.postTypeRequest('datavalidation', projectname);
    }
    checkProjectId(projectname: any): Observable<Object> {
        return this.apiService.postTypeRequest('datavalidation', projectname);
    }
}
