import { Injectable } from '@angular/core';
import { RawProjectListEntryResponseModel } from '../../../../shared/models/raw-project/raw-project-list-response.model';
import { RawProjectGridModel } from './raw-project-grid.model';

@Injectable({
    providedIn: 'root',
})
export class RawProjectGridTransformer {
    transformMany(dtoList: RawProjectListEntryResponseModel[]): RawProjectGridModel[] {
        if (dtoList) {
            return dtoList.map((entry) => {
                return this.transform(entry);
            });
        }
        return [];
    }

    transform(dto: RawProjectListEntryResponseModel): RawProjectGridModel {
        return {
            id: dto.id,
            projectXmlId: dto.projectXmlId,
            name: dto.name,
            version: dto.version,
            dataCreatorId: dto.dataCreatorId,
            editorId: dto.editor.id,
            editorName: dto.editor.name,
            languageCount: dto.languageCount,
        };
    }
}
