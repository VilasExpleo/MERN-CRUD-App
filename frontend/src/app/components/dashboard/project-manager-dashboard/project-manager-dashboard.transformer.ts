import { Injectable } from '@angular/core';
import { ProjectManagerTR } from 'src/app/shared/models/translation-request/pm-translation-request';
import {
    LanguageTranslationRequest,
    ProjectTranslationRequest,
} from './components/grid/translation-request-grid.model';
import { TranslationRequestGridTransformer } from './components/grid/translation-request-grid.transformer';
import { ProjectManagerDashboardModel } from './project-manager-dashboard.model';

@Injectable({
    providedIn: 'root',
})
export class ProjectManagerDashboardTransformer {
    constructor(private translationRequestGridTransformer: TranslationRequestGridTransformer) {}

    transform(response): ProjectManagerDashboardModel {
        return {
            grid: this.translationRequestGridTransformer.transform(response.data),
        };
    }

    // TODO: Temporary conversion, will remove once fix the code for statical evaluation component
    convertToDto(project: ProjectTranslationRequest): ProjectManagerTR {
        if (!project) {
            return undefined;
        }

        return {
            ID: project.id,
            project_id: project.projectId,
            version: this.getVersion(project.versionId),
            version_id: project.versionId,
            project_manager_id: project.projectManagerId,
            proofread: project.isProofReadable ? 'Yes' : 'No',
            description: project.description,
            editor_translate_status: project.editorTranslationStatus,
            editor_due_date: project.editorDueDate.toDateString(),
            language_prop: this.convertToDtoLanguage(project.languages),
            project_title: project.projectTitle,
            progress_main: project.progress,
            document: project.document,
        };
    }

    private convertToDtoLanguage(languages: LanguageTranslationRequest[]) {
        return languages.map((language) => ({
            ID: language.id,
            language_id: language.languageId,
            language_code: language.languageCode,
            pm_status: language.status,
            progress: language.progress,
            project_id: language.projectId,
            return_date: language.returnDate,
            tmanager_email: language.translationManagerEmail,
            tmanager_id: language.translationManagerId,
            total_word_count: language.totalWordCount,
            translation_request: language.translationRequest,
            translation_request_id: language.translationRequestId,
            version_id: language.versionId,
        }));
    }
    private getVersion = (versionId: number) => {
        return +versionId.toString().split('.')[1];
    };
}
