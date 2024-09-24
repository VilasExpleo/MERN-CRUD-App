import { Injectable } from '@angular/core';
import { map, switchMap, take, tap } from 'rxjs';
import {
    TranslationChecksConfigurationModel,
    TranslationChecksTemplateModel,
} from '../../../../../app/components/project/project-properties/translation-checks/translation-checks.model';
import { TranslationChecksTransformer } from '../../../../../app/components/project/project-properties/translation-checks/translation-checks.transformer';
import { ApiBaseResponseModel } from '../../../../../app/shared/models/api-base-response.model';
import { TranslationChecksTemplateRequestModel } from '../../../../../app/shared/models/translation-checks/translation-check-template-request.model';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';
import { ProjectService } from '../project.service';
import { ProjectPropertiesService } from './project-properties.service';

@Injectable({
    providedIn: 'root',
})
export class TranslationChecksService {
    constructor(
        private readonly projectService: ProjectService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly projectPropertiesService: ProjectPropertiesService,
        private readonly translationChecksTransformer: TranslationChecksTransformer
    ) {}

    getTranslationChecks() {
        return this.projectService.getPropertiesState().pipe(
            take(1),
            map((res) => res?.projectData?.checks),
            switchMap((configuration) => this.getTemplates(configuration))
        );
    }

    getTemplates(configuration: TranslationChecksConfigurationModel) {
        const url = 'translation-check-configuration-template/get-template';
        return this.apiService
            .postTypeRequest(url, {
                userId: this.userService.getUser()?.id,
            })
            .pipe(
                map((res: ApiBaseResponseModel) =>
                    this.translationChecksTransformer.transform(res?.data, configuration)
                )
            );
    }

    createTemplate(template: TranslationChecksTemplateModel, templateName: string) {
        const url = `translation-check-configuration-template`;
        const payload = this.getTemplatePayload(template, templateName);

        return this.apiService.postTypeRequest(url, payload);
    }

    updateTemplate(template: TranslationChecksTemplateModel, templateName: string) {
        const url = `translation-check-configuration-template/${template.id}`;
        const payload = this.getTemplatePayload(template, templateName);

        return this.apiService.putTypeRequest(url, payload);
    }

    deleteTemplate(templateId: number) {
        const url = `translation-check-configuration-template/${templateId}`;
        return this.apiService.deleteTypeRequest(url, {
            userId: this.userService.getUser()?.id,
        });
    }

    saveConfiguration(configuration: TranslationChecksConfigurationModel) {
        return this.projectService.getPropertiesState().pipe(
            take(1),
            map((state) => this.getUpdatedPropertiesRequest(state, configuration)),
            switchMap((state) => this.projectPropertiesService.updateProjectProperties(state.properties))
        );
    }

    updatePropertiesOnTabChange(configuration: TranslationChecksConfigurationModel) {
        this.projectService
            .getPropertiesState()
            .pipe(
                take(1),
                map((state) => this.getUpdatedPropertiesRequest(state, configuration)),
                tap((state) =>
                    this.projectService.setPropertiesState({
                        ...state,
                        isProjectPropertiesUpdated: 1,
                    })
                )
            )

            .subscribe();
    }

    private getUpdatedPropertiesRequest(state, configuration: TranslationChecksConfigurationModel) {
        return {
            ...state,
            projectData: { ...state.projectData, checks: configuration },
            properties: { ...state.properties, checks: configuration },
        };
    }

    private getTemplatePayload(
        template: TranslationChecksTemplateModel,
        templateName: string
    ): TranslationChecksTemplateRequestModel {
        return {
            name: templateName ?? template.name,
            userId: this.userService.getUser()?.id,
            configuration: template.configuration,
        };
    }
}
