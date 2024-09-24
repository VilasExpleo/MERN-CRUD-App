import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProjectPropertiesService {
    constructor(private api: ApiService) {}

    private readonly _propertiesIndex = new BehaviorSubject<number>(0);

    readonly propertiesIndex$ = this._propertiesIndex.asObservable();

    setState(value: number) {
        this._propertiesIndex.next(value);
    }

    getState() {
        return this._propertiesIndex.value;
    }

    projectType = 'real';

    getProjectProperties(id) {
        const url = `project-list/${id}?projectType=${this.projectType}`;
        return this.api.getTypeRequest(url, {});
    }

    updateProjectProperties(data) {
        const url = `project-update`;
        return this.api.postTypeRequest(url, data);
    }

    getAvailableLanguages(url) {
        return this.api.getTypeRequest(url, {});
    }
    // get system fonts from server
    getSystemFonts() {
        const url = `project-fonts/system-fonts`;
        return this.api.getTypeRequest(url, {});
    }
    //get prperties for font mapping
    getFontmappingData(data) {
        const url = `project-fonts/font_mapping`;
        return this.api.postTypeRequest(url, data);
    }
    //post font mapping data
    postFontmappingData(data) {
        const url = `project-fonts/update_font`;
        return this.api.postTypeRequest(url, data);
    }
    //download metadata from view project properties
    downloadMetadata(data) {
        const url = `project-list/aws/download`;
        return this.api.postTypeRequest(url, data);
    }
    //update metadata from view project properties
    updateMetadata(data) {
        const url = `project-update/update-project-metadata`;
        return this.api.postTypeRequest(url, data);
    }
    getAllLengthCalculation() {
        const url = `calculate-length/getAllLengthCalculation`;
        return this.api.getTypeRequest(url, {});
    }
    recalculateProject(data) {
        const url = `project-update/recalculate-project`;
        return this.api.postTypeRequest(url, data);
    }

    getAvailableFonts() {
        const url = 'project-create/getfontdetails';
        return this.api.getRequest(url);
    }

    getAvailableLengthCalculations() {
        const url = 'project-create/getlcdetails';
        return this.api.getRequest(url);
    }
}
