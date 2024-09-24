import { Injectable } from '@angular/core';
import { ImportLanguageModel, ProjectVersionModel } from './import-languages.model';

@Injectable({
    providedIn: 'root',
})
export class ImportLanguageTransformer {
    transform(response, title: string): ImportLanguageModel {
        return {
            title,
            versions: this.getVersions(response?.['data']),
        };
    }

    getVersions(versions): ProjectVersionModel[] {
        return versions.map((version) => ({
            projectId: version.projectId,
            versionId: version.versionId,
            displayVersionId: Number((version.versionId % 1).toFixed(2).substring(2)),
        }));
    }
}
