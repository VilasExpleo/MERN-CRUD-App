import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import {
    HelpCreatorTemplateModel,
    HelpCreatorUpdatePageModel,
} from 'src/app/shared/models/help-creator/help-creator-request.model';
import {
    HelpCreatorLinksModel,
    HelpTemplateOptionModel,
    HelpTemplateResponseModel,
} from 'src/app/shared/models/help-creator/help-creator-response.model';
import { HelpCreatorDashboardPageModel } from '../help-creator-dashboard.model';

@Component({
    selector: 'app-help-page',
    templateUrl: './help-page.component.html',
})
export class HelpPageComponent implements OnInit, OnChanges {
    helpPageForm: FormGroup;
    tags: string[] = [];
    links: HelpCreatorLinksModel[] = [];
    templates: HelpTemplateResponseModel[] = [];
    isContentDisabled = true;
    selectedTemplate: HelpTemplateResponseModel;
    selectedValue: number;
    initialFormattedContent = '';

    options$: Observable<HelpTemplateOptionModel>;

    @Input() page: HelpCreatorDashboardPageModel;
    @Input() isPageEditable = false;

    @Output() savePageContentEvent = new EventEmitter<HelpCreatorUpdatePageModel>();

    @ViewChild('tags') inputTag: ElementRef;
    @ViewChild('template') template: ElementRef;

    constructor(private readonly helpCreatorService: HelpCreatorService) {}

    ngOnInit(): void {
        this.initializeHelpPageForm();
        this.getOptions();
    }

    ngOnChanges(): void {
        this.updatePageAndTemplateValue();
    }

    addTag(value: string): void {
        this.tags.push(value);
        this.setTags();
        this.inputTag.nativeElement.value = '';
    }

    getTags(): string[] {
        return this.helpPageForm.get('tags').value;
    }

    deleteTag(index: number): void {
        this.tags.splice(index, 1);
        this.setTags();
    }

    onSubmit(): void {
        const payload: HelpCreatorUpdatePageModel = {
            ...this.helpPageForm.value,
            pageId: this.page.pageId,
            pageTitle: this.page.pageTitle,
            parentPageId: this.page.parentPageId,
        };
        this.updatePageProperties(payload);
    }

    saveTemplate(value: string): void {
        this.template.nativeElement.value = '';
        const payload = this.getTemplatePayload(value);
        this.helpCreatorService.addTemplate(payload).subscribe((response) => {
            if (response) {
                this.templates.push(response);
                this.helpCreatorService.showToastMessage('success', 'Success', 'Template saved successfully');
            }
        });
    }

    updateTemplate() {
        const payload = this.getTemplatePayload(this.selectedTemplate.templateName);
        this.helpCreatorService.updateTemplate(payload, this.selectedTemplate.templateId).subscribe((response) => {
            if (response) {
                this.helpCreatorService.showToastMessage('success', 'Success', 'Template updated successfully');
            }
        });
    }

    onTemplateSelect(value: number): void {
        this.selectedTemplate = this.getTemplateName(value);
        this.helpCreatorService.getTemplateContent(value).subscribe((response) => {
            const content = response?.formattedContent ?? '';
            this.helpPageForm.get('formattedContent').patchValue(content);
            this.helpPageForm.get('formattedContent').markAsTouched();
        });
    }

    deleteTemplate(id: number) {
        this.helpCreatorService.deleteTemplate(id).subscribe((response: ApiBaseResponseModel) => {
            if (response.status === ResponseStatusEnum.OK) {
                this.templates = this.templates.filter((template) => template.templateId !== id);
                this.helpCreatorService.showToastMessage('success', 'Success', 'Template deleted successfully');
            }
        });
    }

    isFormattedContentChangedAndInitialValueChanged(): boolean {
        return (
            (this.helpPageForm.get('formattedContent').touched &&
                this.initialFormattedContent !== this.getFormattedContent()) ||
            this.helpPageForm.get('links').dirty
        );
    }

    private initializeHelpPageForm(): void {
        this.helpPageForm = new FormGroup({
            formattedContent: new FormControl('', [Validators.required]),
            tags: new FormControl([]),
            links: new FormControl([]),
        });
    }

    private updatePageAndTemplateValue(): void {
        if (this.page) {
            this.helpPageForm.reset();
            this.initialFormattedContent = this.page.formattedContent;
            this.helpPageForm.patchValue(this.page);
            this.tags = this.page.tags;
            this.selectedValue = null;
        }
        if (!this.isPageEditable && this.template) {
            this.template.nativeElement.value = '';
        }
    }

    private setTags(): void {
        this.helpPageForm.get('tags').patchValue(this.tags);
    }

    private getOptions(): void {
        this.helpCreatorService.getOptions().subscribe((response: HelpTemplateOptionModel) => {
            this.links = response.links;
            this.templates = response.templates;
        });
    }

    private getFormattedContent(): string {
        return this.helpPageForm.get('formattedContent').value;
    }

    private getTemplateName(value: number): HelpTemplateResponseModel {
        return this.templates.find((template) => template.templateId === value);
    }

    private updatePageProperties(payload: HelpCreatorUpdatePageModel): void {
        this.page.formattedContent = payload.formattedContent;
        this.page.links = payload.links;
        this.page.pageTitle = payload.pageTitle;
        this.savePageContentEvent.emit(payload);
    }

    private getTemplatePayload(value: string): HelpCreatorTemplateModel {
        return {
            formattedContent: this.getFormattedContent(),
            templateName: value,
            userId: this.helpCreatorService.userId,
        };
    }
}
