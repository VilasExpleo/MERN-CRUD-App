import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';

@Injectable({
    providedIn: 'root',
})
export class SampleXmlService {
    constructor(private httpClient: HttpClient, private apiService: ApiService) {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    checkProjectName(projectname): Observable<Object> {
        return this.apiService.postTypeRequest('datavalidation/validate-name', projectname);
    }

    updateXML(): Observable<any> {
        return this.httpClient.get('assets/superhmi.xml');
    }

    getxmlBrand() {
        return this.apiService.getTypeRequest('project-properties/brand', {});
    }
    getxmlType() {
        return this.apiService.getTypeRequest('project-properties/type', {});
    }
}
