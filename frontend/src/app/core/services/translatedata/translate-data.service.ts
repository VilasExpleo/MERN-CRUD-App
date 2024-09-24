import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
@Injectable({
    providedIn: 'root',
})
export class TranslateDataService {
    constructor(private apiService: ApiService) {}

    getTranslateDataFromDB(url: any, id: any) {
        return this.apiService.postTypeRequest(url, id);
    }
    getTranslateTreeData(url: any, id: any) {
        return this.apiService.postTypeRequest(url, id);
    }
    getChildTreeData(url: any, id: any) {
        {
            return this.apiService.postTypeRequest(url, id);
        }
    }
    getLanguageTreeData(url: any, id: any) {
        {
            return this.apiService.postTypeRequest(url, id);
        }
    }

    getExportExcelFromDB(url: any, id: any) {
        return this.apiService.postTypeRequest(url, id);
    }
    // translate service GET
    getTranslateTableLayout(id: any) {
        const url = `configuration/user_id`;
        return this.apiService.postTypeRequest(url, {
            user_id: id,
        });
    }
    checkLayoutName(payload) {
        const url = `configuration/uniquelayout`;
        return this.apiService.postTypeRequest(url, payload);
    }
    // translate service POST
    postTranslateTableLayout(url: any, data: any) {
        return this.apiService.postTypeRequest(url, data);
    }
    // translate Update layout POST
    updateTranslateTableLayout(data: any) {
        const url = `configuration/update`;
        return this.apiService.patchTypeRequest(url, data);
    }
    deleteLayoutDate(url, payload) {
        return this.apiService.deleteTypeRequest(url, payload);
    }

    getTransalationHistory(data: any) {
        const url = `translation-history`;
        return this.apiService.postTypeRequest(url, data);
    }

    getTextnodeProperties(data: any) {
        const url = `textnode-properties`;
        return this.apiService.postTypeRequest(url, data);
    }

    getTranslationHistory(data: any) {
        const url = `translation-history`;
        return this.apiService.postTypeRequest(url, data);
    }

    unmapText(url, data) {
        return this.apiService.patchTypeRequest(url, data);
    }
}
