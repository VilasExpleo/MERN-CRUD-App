import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ProofreaderDashboardRequestModel } from 'src/app/shared/models/proofreader/proofread-api.model';
import { ProofreaderTransformer } from './../../../components/dashboard/proofreader-dashboard/proofreader-transformer';
import { ApiService } from './../api.service';

@Injectable({
    providedIn: 'root',
})
export class ProofreaderService {
    constructor(private api: ApiService, private proofreaderTransformer: ProofreaderTransformer) {}

    getProofreaderRequests(request: ProofreaderDashboardRequestModel) {
        return this.api
            .postTypeRequest('proofread', request)
            .pipe(map((response) => this.proofreaderTransformer.transform(response)));
    }

    updateProofreaderRequestStatus(data) {
        return this.api.patchTypeRequest('proofread/updateStatus', data);
    }
}
