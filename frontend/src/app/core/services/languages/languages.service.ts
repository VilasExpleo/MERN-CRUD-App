import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    constructor(private http: HttpClient) {}

    getLanguages() {
        return this.http.get<TreeNode[]>(`${environment.apiUrl}langdata`).pipe(
            catchError(() => of([])),
            map((response: any) => response?.data)
        );
    }
}
