/* eslint-disable @typescript-eslint/ban-types */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';

@Injectable({
    providedIn: 'root',
})
export class XmlProjectCreationService {
    constructor(private httpClient: HttpClient, private apiService: ApiService) {}

    checkProjectName(projectname: any): Observable<Object> {
        return this.apiService.postTypeRequest('datavalidation/validate-name', projectname);
    }

    updateXML(): Observable<any> {
        return this.httpClient.get('assets/superhmi.xml');
    }
}
