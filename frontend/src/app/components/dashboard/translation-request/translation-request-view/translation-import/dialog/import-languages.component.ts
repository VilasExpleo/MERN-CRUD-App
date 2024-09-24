import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { TranslationImportService } from 'src/app/core/services/translation-import/translation-import.service';
import { ChecklistModel } from 'src/app/shared/models/TranslationRequest/checklist.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { LanguageModel } from './grid/language-grid.model';
import { ImportLanguageModel, ProjectVersionModel } from './import-languages.model';
@Component({
    selector: 'app-import-languages',
    templateUrl: './import-languages.component.html',
})
export class ImportLanguagesComponent implements OnInit {
    isImportButtonDisabled = true;
    selectedProjectVersion: ProjectVersionModel;
    description: string;
    model: ImportLanguageModel;
    selectedLanguages: LanguageModel[] = [];
    checklist: ChecklistModel[] = [];
    constructor(
        private translationRequestDialogReference: DynamicDialogRef,
        private translationImportService: TranslationImportService,
        private eventBus: NgEventBus,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.initialize();
    }

    setSelectedLanguage(languages) {
        this.selectedLanguages = languages;
    }

    initialize() {
        this.translationImportService
            .getTranslationRequestVersion()
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ImportLanguageModel) => {
                if (response) {
                    this.model = response;
                    this.selectedProjectVersion = response.versions[0];
                }
            });
    }

    submitTranslationImportData() {
        const payload = this.translationImportService.createTranslationImportPayload(
            this.selectedLanguages,
            this.description,
            this.selectedProjectVersion
        );
        this.sendTranslationImportDataToServer(payload);
    }

    sendTranslationImportDataToServer(payload) {
        const url = `translation-import`;
        this.translationImportService
            .createNewTranslationImportRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                if (response) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Translation Import',
                        detail: 'Data imported successfully',
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Translation Import',
                        detail: 'Failed to import Data',
                    });
                }
            });
        this.eventBus.cast('dashboard:data', {
            projectName: this.model?.title,
            version_no: '00',
        });
        this.closeTranslationRequestDialog();
    }

    closeTranslationRequestDialog() {
        this.translationRequestDialogReference.close();
    }

    getChecklist(language: LanguageModel) {
        this.translationImportService
            .getChecklist(language)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: ApiBaseResponseModel) => {
                if (res.status === ResponseStatusEnum.OK) {
                    this.checklist = res.data;
                }
            });
    }
}
