import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, take } from 'rxjs';
import { ManageRawProjectLanguageStepModel } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/language/manage-raw-project-language-step.model';
import {
    FontPackageModel,
    LanguageModel,
    LengthCalculationModel,
    ManageRawProjectAvailableOptionsModel,
    ManageRawProjectModel,
    ManageRawProjectStateModel,
    PlaceholderModel,
    ProjectType,
} from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { ManageRawProjectDetailsStepModel } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/projectDetails/manage-raw-project-details-step.model';
import { ManageRawProjectDetailsStepTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/projectDetails/manage-raw-project-details-step.transformer';
import { ManageRawProjectVerificationStepModel } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/verification/manage-raw-project-verification-step.model';
import { ManageRawProjectVerificationStepTransformer } from '../../../components/dashboard/data-creator-dashboard/create-raw-project-dialog/verification/manage-raw-project-verification-step.transformer';
import { UseCaseEnum } from '../../../shared/enums/use-case.enum';
import { RawProjectService } from './raw-project.service';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectService {
    constructor(
        private rawProjectService: RawProjectService,
        private manageRawProjectVerificationStepTransformer: ManageRawProjectVerificationStepTransformer,
        private manageRawProjectDetailsStepTransformer: ManageRawProjectDetailsStepTransformer
    ) {}
    private manageRawProjectModelObs$: BehaviorSubject<ManageRawProjectStateModel> = new BehaviorSubject(null);

    getManageRawProjectModel(): Observable<ManageRawProjectStateModel> {
        return this.manageRawProjectModelObs$.asObservable();
    }

    setManageRawProjectModel(model: ManageRawProjectStateModel) {
        this.manageRawProjectModelObs$.next(model);
    }

    getInitialState(): ManageRawProjectStateModel {
        return this.getInitialManageRawProjectModel();
    }

    getDataForStepProjectDetails(): Observable<ManageRawProjectDetailsStepModel> {
        const viewModelObs$ = this.getManageRawProjectModel().pipe(take(1));
        const getProjectTypesObs$ = this.rawProjectService.getProjectTypes().pipe(take(1));

        return forkJoin([viewModelObs$, getProjectTypesObs$]).pipe(
            map((response: [ManageRawProjectStateModel, ProjectType[]]) =>
                this.manageRawProjectDetailsStepTransformer.transform(response)
            )
        );
    }

    getDataForStepLanguages(): Observable<ManageRawProjectLanguageStepModel> {
        const viewModelObs$ = this.getManageRawProjectModel().pipe(take(1));
        const getLanguagesObs$ = this.rawProjectService.getLanguages().pipe(take(1));

        return forkJoin([viewModelObs$, getLanguagesObs$]).pipe(
            map((response: [ManageRawProjectStateModel, LanguageModel[]]) => ({
                model: response[0],
                languages: response[1],
            }))
        );
    }

    getDataForStepVerification(): Observable<ManageRawProjectVerificationStepModel> {
        const viewModelObs$ = this.getManageRawProjectModel().pipe(take(1));
        const getSystemFonts$ = this.rawProjectService.getSystemFonts().pipe(take(1));
        const getLengthCalculations$ = this.rawProjectService.getLengthCalculations().pipe(take(1));

        return forkJoin([viewModelObs$, getSystemFonts$, getLengthCalculations$]).pipe(
            map((response: [ManageRawProjectStateModel, FontPackageModel[], LengthCalculationModel[]]) =>
                this.manageRawProjectVerificationStepTransformer.transform(response)
            )
        );
    }

    private getInitialManageRawProjectModel(): ManageRawProjectStateModel {
        return {
            rawProject: this.getInitialManageRawProjectDetailsModel(),
            availableOptions: this.getManageRawProjectAvailableOptionsModel(),
            useCase: UseCaseEnum.Create,
        };
    }

    private getInitialManageRawProjectDetailsModel(): ManageRawProjectModel {
        return {
            id: null,
            projectXmlId: '',
            projectName: null,
            projectType: null,
            description: '',
            variants: [],
            languages: [],
            placeholders: [
                {
                    id: 1,
                    symbol: '%n',
                    canDelete: false,
                } as PlaceholderModel,
                {
                    id: 2,
                    symbol: '${n}',
                    canDelete: false,
                } as PlaceholderModel,
                {
                    id: 3,
                    symbol: '[%n]',
                    canDelete: false,
                } as PlaceholderModel,
            ],
            fontPackages: [],
            lengthCalculations: [],
            fonts: [],
            fontPackage: {} as FontPackageModel,
        };
    }

    private getManageRawProjectAvailableOptionsModel(): ManageRawProjectAvailableOptionsModel {
        return {
            projectTypes: [],
            languages: [],
            fontPackages: [],
            lengthCalculations: [],
            placeholders: [],
        };
    }
}
