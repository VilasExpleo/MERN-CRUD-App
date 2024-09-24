import { Injectable } from '@angular/core';
import { ProjectTranslationRequest, TranslationRequestGridModel } from './translation-request-grid.model';
@Injectable({
    providedIn: 'root',
})
export class TranslationRequestGridTransformer {
    transform(response): TranslationRequestGridModel {
        return {
            colsForExpandedRow: this.getColsForExpandedRow(),
            projects: this.transformProjects(response),
        };
    }

    private getColsForExpandedRow() {
        return [
            {
                field: 'translationManagerEmail',
                header: 'Translation Manager',
            },
            {
                field: 'languageCode',
                header: 'Languages',
            },
            {
                field: 'Returned',
                header: 'Returned',
            },
        ];
    }

    private transformProjects(projects): ProjectTranslationRequest[] {
        return projects.map((project: Partial<ProjectTranslationRequest>) => {
            const dueDate = new Date(project.editorDueDate);
            const remainingTime = dueDate.getTime() - new Date().getTime();
            const brand_name = project.brandName.trim();
            return {
                ...project,
                editorDueDate: new Date(project.editorDueDate),
                version: this.getVersion(project.versionId),
                dueDateToProjectManager: !project.dueDateToProjectManager
                    ? null
                    : new Date(project.dueDateToProjectManager),
                remainingTime: Math.ceil(remainingTime / (1000 * 60 * 60 * 24)),
                brandName: brand_name,
                proofread: project.isProofReadable ? 'Yes' : 'No',
            };
        });
    }
    private getVersion = (versionId: number) => {
        return +versionId.toString().split('.')[1];
    };
}
