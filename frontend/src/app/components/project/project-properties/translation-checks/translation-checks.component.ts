import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of, tap } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { GridService } from 'src/app/core/services/grid/grid.service';
import { TranslationChecksService } from 'src/app/core/services/project/project-properties/translation-checks.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { TranslationCheckDisplayEnum, TranslationCheckType } from './translation-checks-enum';
import { TranslationChecksTemplateModel } from './translation-checks.model';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
@Component({
    selector: 'app-translation-checks',
    templateUrl: './translation-checks.component.html',
    styleUrls: ['./translation-checks.component.scss'],
})
export class TranslationChecksComponent implements OnInit, OnDestroy {
    // Template text
    description = 'See below for a summary of the most important project properties';
    translationChecksHeaderText = 'Translation Checks';
    resultsHeaderText = 'Results';
    saveTemplatePlaceholderText = 'Save as new template';

    showConfirmation = false;
    isLoading = true;
    templateName = '';
    selectedTemplate: TranslationChecksTemplateModel;
    translationCheckLevels = [];
    translationCheckDisplayEnum = TranslationCheckDisplayEnum;
    templates: TranslationChecksTemplateModel[];

    @Output()
    closeDialogEvent = new EventEmitter();
    isRawProject = false;
    constructor(
        private readonly messageService: MessageService,
        private readonly dialogRef: DynamicDialogRef,
        private readonly translationChecksService: TranslationChecksService,
        private readonly gridService: GridService,
        private readonly projectPropertiesService: ProjectPropertiesService
    ) {}

    ngOnInit(): void {
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.translationCheckLevels = this.gridService.getFilterFromNumericEnum(TranslationCheckType);
        this.translationChecksService.getTranslationChecks().subscribe((templates) => {
            this.isLoading = false;
            this.templates = templates;
            this.selectedTemplate = templates[0];
            this.templateName = this.selectedTemplate.name;
        });
    }

    get configuration() {
        return Object.keys(this.selectedTemplate.configuration);
    }

    isObject(key: string) {
        return typeof this.selectedTemplate.configuration[key] === 'object';
    }

    setTranslationCheckType(event: any, key: string) {
        if (this.isObject(key)) {
            this.selectedTemplate.configuration[key].type = event.value;
        } else {
            this.selectedTemplate.configuration[key] = event.value;
        }
    }

    setTranslationCheckValue(event: any, key: string) {
        this.selectedTemplate.configuration[key].value = event.target.value;
    }

    onTemplateChange(template) {
        this.selectedTemplate = template;
        this.templateName = template.name;
    }

    setTemplateName(event) {
        this.templateName = event.target.value?.trim();
    }

    saveConfiguration() {
        this.translationChecksService
            .saveConfiguration({ ...this.selectedTemplate.configuration })
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                this.closeDialogEvent.emit();
                response && this.handleSuccessMessage('Project properties updated successfully');
            });
    }

    deleteTemplate(event: Event, templateId: number) {
        event.stopPropagation();
        this.translationChecksService
            .deleteTemplate(templateId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: ApiBaseResponseModel) => {
                if (res?.status === ResponseStatusEnum.OK) {
                    this.handleSuccessMessage(res?.message);

                    this.templates = this.templates.filter(
                        (template: TranslationChecksTemplateModel) => template.id !== templateId
                    );
                }
            });
    }

    cancel() {
        this.showConfirmation = true;
    }

    onAccept() {
        this.dialogRef.close();
    }

    onReject() {
        this.showConfirmation = false;
    }

    ngOnDestroy() {
        this.translationChecksService.updatePropertiesOnTabChange({ ...this.selectedTemplate.configuration });
    }

    saveTemplate() {
        this.selectedTemplate?.id ? this.updateTemplate() : this.createTemplate();
    }

    private createTemplate() {
        this.translationChecksService
            .createTemplate(this.selectedTemplate, this.templateName)
            .pipe(
                tap((response: ApiBaseResponseModel) => {
                    if (response?.status === ResponseStatusEnum.OK) {
                        this.handleSuccessMessage(`Translation check configuration template created successfully!`);
                        this.templates.push(response.data);
                    }
                })
            )
            .subscribe();
    }

    private updateTemplate() {
        this.translationChecksService
            .updateTemplate(this.selectedTemplate, this.templateName)
            .pipe(
                tap((response: ApiBaseResponseModel) => {
                    if (response?.status === ResponseStatusEnum.OK) {
                        const index = this.templates.findIndex((template) => template.id === response.data?.id);
                        if (index > -1) {
                            this.templates[index] = response.data;
                            this.handleSuccessMessage(`Translation check configuration template update successfully!`);
                        }
                    }
                })
            )
            .subscribe();
    }

    private handleSuccessMessage(detail: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail,
        });
    }

    nextTab(): void {
        this.projectPropertiesService.setState(7);
    }

    prevTab(): void {
        this.projectPropertiesService.setState(5);
    }
}
