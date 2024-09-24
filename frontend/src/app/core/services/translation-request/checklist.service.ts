import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CheckListUpdateRequestModel } from 'src/app/shared/models/TranslationRequest/checklist-update-request.model';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { ApiService } from '../api.service';

@Injectable({
    providedIn: 'root',
})
export class ChecklistService {
    constructor(private api: ApiService) {}

    TranslationRequestChecklistState = new BehaviorSubject<ChecklistModel[]>([]);
    TranslationRequestChecklist$ = this.TranslationRequestChecklistState.asObservable();

    getChecklist(): Observable<ChecklistModel[]> {
        return this.TranslationRequestChecklist$;
    }

    setChecklist(checklist: ChecklistModel[]) {
        this.TranslationRequestChecklistState.next(checklist);
    }

    updateChecklist(payload: CheckListUpdateRequestModel) {
        const url = 'translator-dashboard/update-check';
        return this.api.patchTypeRequest(url, payload);
    }
}
