import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    constructor(private api: ApiService, private user: UserService) {}

    getXsltList(data?) {
        return this.api.postTypeRequest('export/getXsltList', data);
    }
    renameFileName(payload: any) {
        return this.api.postTypeRequest('export/renameXslt', payload);
    }
    deleteFile(payload: any) {
        return this.api.deleteTypeRequest('export/deleteXslt', payload);
    }
    getExportData(payload: any) {
        return this.api.highPriorityPostTypeRequest('export/generateExportXml', payload);
    }
    saveExportXslt(payload: any) {
        return this.api.postTypeRequest('export/saveExportXslt', payload);
    }
    getFileData(payload: any) {
        return this.api.postTypeRequest('export/getXslt', payload);
    }
    checkProjectErrorAndPendingTranslation(payload: any) {
        return this.api.postTypeRequest('export/ExportMessages', payload);
    }
}
