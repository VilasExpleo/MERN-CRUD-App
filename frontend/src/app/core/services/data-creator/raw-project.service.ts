import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { AssignEditorOptionsTransformer } from 'src/app/components/raw-project/manage-textnodes/transformer/assign-editor-options.transfomer';
import { RawProjectPropertiesTransformer } from 'src/app/components/raw-project/raw-project-properties.transformer';
import { AssignUserModel } from 'src/app/shared/components/assign-user/assign-user.model';
import { AssignEditorRequestModel } from 'src/app/shared/models/data-creator/assign-editor-request.model';
import { LanguageTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/language/manage-raw-project-language.transformer';
import {
    FontPackageModel,
    LanguageModel,
    LengthCalculationModel,
    ManageRawProjectModel,
} from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { RawProjectManageRequestTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/raw-project-manage-request.transformer';
import { ManageRawProjectLengthCalculationTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/verification/manage-raw-project-length-calculation.transformer';
import { ManageRawProjectSystemFontTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/verification/manage-raw-project-system-font.transformer';
import { RawProjectDeleteTransformer } from '../../../components/dashboard/data-creator-dashboard/raw-project-grid/raw-project-delete-transformer.service';
import { RawProjectGridModel } from '../../../components/dashboard/data-creator-dashboard/raw-project-grid/raw-project-grid.model';
import { RawProjectGridTransformer } from '../../../components/dashboard/data-creator-dashboard/raw-project-grid/raw-project-grid.transformer';
import { ProjectType } from '../../../components/project/components/properties/editable-properties.model';
import { EditablePropertiesTransformer } from '../../../components/project/components/properties/editable-properties.transformer';
import { ApiBaseResponseModel } from '../../../shared/models/api-base-response.model';
import { RawProjectCheckUniquePropertiesResponseModel } from '../../../shared/models/raw-project/raw-project-check-unique-properties-response.model';
import { RawProjectListResponseModel } from '../../../shared/models/raw-project/raw-project-list-response.model';
import { RawProjectCheckUniquePropertiesValidatorModel } from '../../async-validators/raw-project-check-unique-properties-validator.model';
import { RawProjectCheckUniquePropertiesTransformer } from '../../async-validators/raw-project-check-unique-properties.transformer';
import { ApiService } from '../api.service';
import { ProjectPropertiesService } from '../project/project-properties/project-properties.service';
import { ProjectService } from '../project/project.service';
import { SampleTextCatalogService } from '../sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class RawProjectService {
    private entityUrl = 'raw-project';
    private brandId: number;
    constructor(
        private api: ApiService,
        private userService: UserService,
        private transformer: RawProjectGridTransformer,
        private projectService: ProjectService,
        private editablePropertyTransformer: EditablePropertiesTransformer,
        private sampleTextCatalogService: SampleTextCatalogService,
        private languageTransformer: LanguageTransformer,
        private projectPropertiesService: ProjectPropertiesService,
        private manageRawProjectLengthCalculationTransformer: ManageRawProjectLengthCalculationTransformer,
        private manageRawProjectSystemFontTransformer: ManageRawProjectSystemFontTransformer,
        private rawProjectManageRequestTransformer: RawProjectManageRequestTransformer,
        private rawProjectDeleteTransformer: RawProjectDeleteTransformer,
        private rawProjectCheckUniquePropertiesTransformer: RawProjectCheckUniquePropertiesTransformer,
        private rawProjectPropertiesTransformer: RawProjectPropertiesTransformer,
        private assignEditorOptionsTransformer: AssignEditorOptionsTransformer
    ) {
        this.brandId = this.userService.getUser().brand_id;
    }

    getProjectTypes(): Observable<ProjectType[]> {
        return this.projectService
            .getTypes()
            .pipe(map((types) => this.editablePropertyTransformer.getTypes(types?.['data'])));
    }

    getLanguages(): Observable<LanguageModel[]> {
        return this.sampleTextCatalogService
            .getSTCLanguages('stclanguages')
            .pipe(map((languages) => this.languageTransformer.transform(languages?.['data'])));
    }

    getLengthCalculations(): Observable<LengthCalculationModel[]> {
        return this.projectPropertiesService
            .getAvailableLengthCalculations()
            .pipe(
                map((lengthCalculations: ApiBaseResponseModel) =>
                    this.manageRawProjectLengthCalculationTransformer.transform(lengthCalculations.data)
                )
            );
    }

    getSystemFonts(): Observable<FontPackageModel[]> {
        return this.projectPropertiesService
            .getAvailableFonts()
            .pipe(
                map((fontPackages: ApiBaseResponseModel) =>
                    this.manageRawProjectSystemFontTransformer.transform(fontPackages.data)
                )
            );
    }

    getRawProjects(): Observable<RawProjectGridModel[]> {
        return this.api
            .getRequest<RawProjectListResponseModel>(this.entityUrl + '/list-dc/' + this.userService.getUser().id)
            .pipe(map((response) => this.transformer.transformMany(response.data)));
    }

    getProjectProperties(rawProjectId: number): Observable<ManageRawProjectModel> {
        return this.api
            .getRequest(this.entityUrl + '/properties/' + rawProjectId)
            .pipe(
                map((response: ApiBaseResponseModel) => this.rawProjectPropertiesTransformer.transform(response.data))
            );
    }

    createRawProject(rawProject: ManageRawProjectModel): Observable<RawProjectGridModel> {
        const requestData = this.rawProjectManageRequestTransformer.transform(rawProject);

        return this.api
            .postTypeRequest(this.entityUrl + '/create/' + this.userService.getUser().id, requestData)
            .pipe(map((response: ApiBaseResponseModel) => this.transformer.transform(response?.data)));
    }

    checkUniqueProperties(
        validatorModel: RawProjectCheckUniquePropertiesValidatorModel
    ): Observable<RawProjectCheckUniquePropertiesResponseModel[]> {
        const requestData =
            this.rawProjectCheckUniquePropertiesTransformer.transformValidatorToRequestModel(validatorModel);

        return this.api
            .postTypeRequest(this.entityUrl + '/check-unique-raw-project-properties', requestData)
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectCheckUniquePropertiesTransformer.transformManyResponseToValidationResultModel(
                        response?.data
                    )
                )
            );
    }

    deleteRawProject(rawProjectId: number): Observable<boolean> {
        //ToDo:can be removed after B2B authorization is in place
        // backend can then decide on its own if the logged in user connected with jwt token has sufficient rights to delete a raw-project

        const requestData = {
            userId: this.userService.getUser().id,
        };
        return this.api
            .deleteTypeRequest(this.entityUrl + '/delete/' + rawProjectId, requestData)
            .pipe(map((response: ApiBaseResponseModel) => this.rawProjectDeleteTransformer.transform(response.status)));
    }

    updateRawProject(rawProject: ManageRawProjectModel) {
        const requestData = this.rawProjectManageRequestTransformer.transform(rawProject);
        return this.api.postTypeRequest(this.entityUrl + '/update/' + rawProject.id, requestData);
    }

    getEditors(): Observable<AssignUserModel[]> {
        return this.api.getRequest(`${this.entityUrl}/editors/${this.brandId}`).pipe(
            catchError(() => of([])),
            map((response: ApiBaseResponseModel) => this.assignEditorOptionsTransformer.transform(response.data))
        );
    }

    assign(payload: AssignEditorRequestModel, projectId: number): Observable<ApiBaseResponseModel> {
        return this.api.postTypeRequest(`${this.entityUrl}/assign/${projectId}`, payload);
    }

    sendToUpdate(payload: AssignEditorRequestModel, projectId: number): Observable<ApiBaseResponseModel> {
        return this.api.postTypeRequest(`${this.entityUrl}/send-update/${projectId}`, payload);
    }
}
