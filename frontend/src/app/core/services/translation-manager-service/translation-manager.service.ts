import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TranslationManagerModule } from 'src/app/components/translation-manager/translation-manager.module';
import { TranslationManager } from '../../../shared/models/tmdata';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: TranslationManagerModule,
})
export class TranslationManagerService {
    private assignWorkeDialogSubject = new Subject<any>();

    constructor(private api: ApiService) {}

    getList(url, postUserId) {
        return this.api.postTypeRequest(url, postUserId);
    }
    saveData(postData) {
        return this.api.postTypeRequest('translation-manager-dashboard/assign-worker', postData);
    }
    deleteData(postData) {
        return this.api.deleteTypeRequest('translation-manager-dashboard/delete_template', postData);
    }

    openAssignWorkerDialog(projectdata: TranslationManager) {
        this.assignWorkeDialogSubject.next(projectdata);
    }

    clearAssignWorkerDialog() {
        this.assignWorkeDialogSubject.next('');
    }

    getAssignWorkerDialog(): Observable<any> {
        return this.assignWorkeDialogSubject.asObservable();
    }
}
