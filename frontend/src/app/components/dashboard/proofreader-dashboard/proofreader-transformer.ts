import { Injectable } from '@angular/core';
import {
    LanguageWiseProofreaderModel,
    ProofreaderRequestModel,
} from 'src/app/shared/models/proofreader/proofread-api.model';
import { ProofreaderDashboardModel, ProofreaderModel } from './proofreader.model';
import { Brand } from 'src/app/shared/models/brand';
@Injectable({
    providedIn: 'root',
})
export class ProofreaderTransformer {
    transform(response): ProofreaderDashboardModel {
        return {
            projects: this.transformProjects(response.data),
        };
    }

    private transformProjects(projects: ProofreaderRequestModel[]): ProofreaderModel[] {
        return projects.map((project: ProofreaderRequestModel) => {
            const brandName = project.brandName.trim();
            const remainingTime = new Date(project.dueDate?.trim()).getTime() - new Date().getTime();
            return {
                brandUrl: Brand.getBrand(project.brandId).getLogo(),
                // Refactored: brandUrl: BrandLogoEnum[project.brandId],
                brandName,
                document: project.document,
                dueDate: new Date(project.dueDate?.trim()),
                projectName: project.projectName,
                projectId: project.projectId,
                remainingTime: Math.ceil(remainingTime / (1000 * 60 * 60 * 24)),
                versionId: project.versionId,
                status: project.status,
                translationRequestId: project.translationRequestId,
                sourceLanguage: project.sourceLanguage,
                languages: this.getProofreaderRequests(project.languages),
                description: project?.description,
                documentCount: project.documentCount,
                lcPath: project?.lcPath,
                fontPath: project?.fontPath,
            };
        });
    }

    private getProofreaderRequests(proofreadRequests: LanguageWiseProofreaderModel[]) {
        return proofreadRequests.map((request: LanguageWiseProofreaderModel) => ({
            ...request,
            returnDate: request.returnDate?.trim() ? new Date(request.returnDate?.trim()) : undefined,
        }));
    }
}
