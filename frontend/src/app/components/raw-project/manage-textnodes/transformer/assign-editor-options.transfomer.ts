import { Injectable } from '@angular/core';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { AssignEditorOptionsResponseModel } from 'src/app/shared/models/data-creator/assign-edior-options-response.model';

@Injectable({
    providedIn: 'root',
})
export class AssignEditorOptionsTransformer {
    transform(response: AssignEditorOptionsResponseModel[]): AssignUserModel[] {
        return response.map((assignEditorOptionsResponseModel: AssignEditorOptionsResponseModel) => {
            return this.editor(assignEditorOptionsResponseModel);
        });
    }

    editor(response: AssignEditorOptionsResponseModel): AssignUserModel {
        return {
            id: response.userId,
            name: response.userName,
        };
    }
}
