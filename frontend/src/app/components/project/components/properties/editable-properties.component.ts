import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, filter, map, of, switchMap, take, tap } from 'rxjs';
import { ProjectnameValidator } from 'src/app/core/async-validators/project-name-validator';
import { ProjectPropertiesService } from 'src/app/core/services/project/project-properties/project-properties.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ProjectFlow } from './editable-properties.enum';
import { EditablePropertiesModel, PlaceholderModel, initialEditableProperties } from './editable-properties.model';

@Component({
    selector: 'app-editable-properties',
    templateUrl: './editable-properties.component.html',
})
export class EditablePropertiesComponent implements OnInit, OnDestroy {
    model: EditablePropertiesModel = initialEditableProperties;
    projectFlow = ProjectFlow;
    minDate = new Date();
    isRawProject = false;

    // TODO: Provide the formType to fromGroup
    propertiesForm: FormGroup = this.initializeForm(initialEditableProperties);
    customPlaceholderValidationErrors: string[] = [];

    @ViewChild('customPlaceholderSymbol')
    customPlaceholderSymbol: ElementRef;

    @Output()
    closeEvent = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        private projectService: ProjectService,
        private projectPropertiesService: ProjectPropertiesService, // TODO: Remove this service while using SRM
        private router: Router,
        private messageService: MessageService,
        private userService: UserService, // TODO: Remove this service while handling SRM
        private confirmationService: ConfirmationService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit() {
        this.isRawProject = this.projectPropertiesService.projectType === 'raw' ?? true;
        this.projectService
            .getEditableProperties()
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: EditablePropertiesModel) => {
                if (response) {
                    this.model = response;
                    this.propertiesForm.patchValue(response);
                    if (response?.placeholders) {
                        this.setPlaceholders(response.placeholders);
                    }
                    this.addValidatorsOnProjectName();
                }
            });
    }

    // TODO: Form should auto save on tab change so doing here but needs to move or find a better solution of the code
    ngOnDestroy(): void {
        this.clearLocalStorage();
        this.saveDataOnTabChange();
    }

    get placeholders() {
        return this.propertiesForm.controls['placeholders'] as FormArray;
    }

    get projectName() {
        return this.propertiesForm.get('projectName') as FormControl;
    }

    get projectType() {
        return this.propertiesForm.controls['projectType'];
    }

    getCustomPlaceholderValidationErrors() {
        return this.customPlaceholderValidationErrors;
    }

    confirmAndAddPlaceholder(symbol: string) {
        if (this.isInvalidPlaceholderSymol(symbol)) {
            this.customPlaceholderSymbol.nativeElement.value = symbol.trim();
            return;
        }

        this.customPlaceholderSymbol.nativeElement.value = '';

        if (this.model.projectFlow === ProjectFlow.create) {
            this.addPlaceholder(symbol);
            return;
        }

        if (this.localStorageService.get('addPlaceholder')) {
            this.addPlaceholder(symbol);
            return;
        }

        this.confirmationService.confirm({
            message: `You are about to make changes to attributes of the project, 
            that will lead to a mass operation and recalculation of all project texts. 
            This message will not be shown again during the current session.`,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'okay',
            rejectVisible: false,
            acceptButtonStyleClass: 'mt-3',
            accept: () => {
                this.addPlaceholder(symbol);
                this.localStorageService.set('addPlaceholder', true);
            },
        });
    }

    removePlaceholderSymbol(symbol: string) {
        if (this.model.projectFlow === ProjectFlow.create) {
            this.removePlaceholder(symbol);
            return;
        }

        if (this.localStorageService.get('removePlaceholder')) {
            this.removePlaceholder(symbol);
            return;
        }

        this.confirmationService.confirm({
            message: `You are about to delete an active placeholder symbol from your project. 
            This will cause a re-calculation of all project texts and a project update. 
            Additionally, all data related to this placeholder will be permamently lost. 
            Are you sure, you want to proceed?`,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger mt-3',
            rejectButtonStyleClass: 'p-button-outlined',
            accept: () => {
                this.removePlaceholder(symbol);
                this.localStorageService.set('removePlaceholder', true);
            },
        });
    }

    showWarningOnPlaceholderToggle() {
        if (this.model.projectFlow === ProjectFlow.create) {
            return;
        }

        if (this.localStorageService.get('togglePlaceholder')) {
            return;
        }

        if (this.isRawProject) {
            return;
        }

        this.confirmationService.confirm({
            message: `You are about to make changes to attributes of the project, 
            that will lead to a mass operation and recalculation of all project texts. 
            This message will not be shown again during the current session.`,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'okay',
            rejectVisible: false,
            acceptButtonStyleClass: 'mt-3',
            accept: () => this.localStorageService.set('togglePlaceholder', true),
        });
    }

    submit() {
        if (this.propertiesForm.invalid) {
            return;
        }

        // TODO: Remove multiple state handling
        this.projectService
            .getPropertiesState()
            .pipe(
                take(1),
                map((state) => this.getUpdatedPropertiesRequest(state)),
                switchMap((properties) => {
                    return this.projectPropertiesService.updateProjectProperties(properties).pipe(
                        catchError(() => of(undefined)),
                        filter((response) => response?.['status'] === 'OK'),
                        tap(() =>
                            this.projectService.setPropertiesState({
                                ...properties,
                                isProjectPropertiesUpdated: 1,
                            })
                        )
                    );
                })
            )
            .subscribe((response) => {
                if (response) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Project properties updated successfully',
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed',
                        detail: 'Failed to update Project properties.',
                    });
                }

                // TODO: We suppose to close the dialog as soon as submit button is clicked and handle the error message as toast
                // OR we should show the error on dialog if there is any validation issue
                this.closeEvent.emit();
            });
    }

    prev() {
        this.projectService.setlangPropertiesState(this.getUpdatedForm());
        this.router.navigate(['main/dashboard/base-file']);
    }

    next() {
        if (this.propertiesForm.invalid) {
            return;
        }

        this.projectService.setlangPropertiesState(this.getUpdatedForm());
        this.router.navigate(['main/dashboard/language-setting']);
    }

    // TODO: Handle this cancel method on header cross icon later
    cancel(isProjectProperties?: boolean) {
        if (!isProjectProperties) {
            this.showWarning(isProjectProperties);
        }

        if (isProjectProperties && (this.propertiesForm.dirty || this.model.isProjectUpdateInProgress)) {
            this.showWarning(isProjectProperties);
        } else {
            this.closeEvent.emit();
        }
    }

    private clearLocalStorage() {
        this.localStorageService.removeKeys(['addPlaceholder', 'removePlaceholder', 'togglePlaceholder']);
    }

    private saveDataOnTabChange() {
        this.model.projectFlow === 'properties' &&
            this.projectService
                .getPropertiesState()
                .pipe(take(1))
                .subscribe((state) => this.updatePropertiesOnTabChange(state));
    }

    private addValidatorsOnProjectName() {
        this.projectName.addValidators([
            Validators.required,
            Validators.pattern('[ A-Za-z0-9_-]*'),
            Validators.minLength(3),
        ]);

        this.projectName.addAsyncValidators(
            ProjectnameValidator.createValidator(this.projectService, this.model.projectName, this.model.projectFlow)
        );

        this.projectName.updateValueAndValidity();
    }

    private addPlaceholder(symbol: string) {
        const placeholder = { symbol, isActive: true, canDelete: true };
        const customPlaceholderGroup = this.formBuilder.group(placeholder);

        this.placeholders.insert(0, customPlaceholderGroup);
    }

    private removePlaceholder(symbol: string) {
        const index = this.placeholders.controls.findIndex(
            (placeholderControl) => placeholderControl.value.symbol === symbol
        );
        this.placeholders.removeAt(index);
    }

    private showWarning(isProjectProperties: boolean) {
        this.confirmationService.confirm({
            message: 'The data may be lost if you cancel the project creation. Are you sure you want to cancel?',
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger mt-3',
            rejectButtonStyleClass: 'p-button-outlined',
            accept: () => {
                if (isProjectProperties) this.closeEvent.emit();
                else {
                    this.projectService.closeCreateDialog();
                    this.router.navigate(['main/dashboard']);
                }
                this.resetState();
            },
        });
    }

    private setPlaceholders(placeholders: PlaceholderModel[]) {
        placeholders.forEach((placeholder: PlaceholderModel) => {
            const group = this.formBuilder.group({
                id: placeholder.id,
                symbol: placeholder.symbol,
                isActive: placeholder.isActive,
                canDelete: placeholder.canDelete,
            });

            this.placeholders.push(group);
        });
    }

    private getUpdatedForm() {
        const form = this.propertiesForm.value;
        return {
            projectName: form.projectName,
            brand: form.brand,
            project_type: form.projectType,
            mainDefinitionPlaceHolder: form.placeholders,
            finalDelivery: form.deliveryDate,
            description: form.description,
        };
    }

    private isInvalidPlaceholderSymol(symbol: string) {
        this.customPlaceholderValidationErrors = [];
        if (symbol.trim().length < 2) {
            this.customPlaceholderValidationErrors.push('Custom placeholder should have min 2 characters');
            return true;
        }

        const isExist = !!this.placeholders.controls.find(
            (placeholderControl) => placeholderControl.value.symbol.trim() === symbol.trim()
        );

        if (isExist) {
            this.customPlaceholderValidationErrors.push('Placeholder is already available');
        }

        const hasWhiteSpace = symbol.trim().split(' ').length > 1;
        if (hasWhiteSpace) {
            this.customPlaceholderValidationErrors.push(
                'Custom placeholder should not have space in between of symbol'
            );
            return true;
        }

        return isExist;
    }

    private initializeForm(model: EditablePropertiesModel) {
        // TODO: Current bug - Existing name validation is only availble for creation
        // Suppose to use for project properties for update intelligently

        return this.formBuilder.group({
            projectName: [model.projectName],
            brand: [model.brand],
            projectType: [model.projectType, [Validators.required]],
            deliveryDate: [model?.deliveryDate || ''],
            description: [model?.description || ''],
            placeholders: this.formBuilder.array([]),
        });
    }

    // TODO: Shift this method to state initialization, So we can skip the state reset for each tab
    private resetState() {
        this.projectService.setBaseFileState(null);
        this.projectService.setlangPropertiesState(null);
        this.projectService.setLangSettingState(null);
        this.projectService.setLangInheritanceState(null);
        this.projectService.setMetaDataState(null);
        this.projectService.setUserSettingState(null);
    }

    // TODO : Remove this method once implement single state of project
    private getUpdatedPropertiesRequest(state) {
        const projectProperties = state.properties?.['project_properties'];
        const updatedProperties = this.getUpdatedForm();
        const propertiesPayload = {
            ...projectProperties,
            brand_id: updatedProperties.brand?.id ?? projectProperties?.['brand_id'],
            project_type: updatedProperties.project_type?.id ?? projectProperties?.['project_type'],
            placeholder: updatedProperties.mainDefinitionPlaceHolder ?? projectProperties?.['placeholder'],
            due_date: updatedProperties.finalDelivery ?? projectProperties?.['due_date'],
            description: updatedProperties.description ?? projectProperties?.['description'],
            title: updatedProperties.projectName ?? projectProperties?.['title'],
            existing_project_id: projectProperties?.['existing_project_id']?.trim(),
            user_id: this.userService.getUser()?.id,
            isProjectUpdateInProgress: false,
        };

        return {
            language_inheritance: state.properties?.['language_inheritance'],
            language_inheritance_tree: state.properties?.['language_inheritance_tree'],
            language_mapping: state.properties?.['language_mapping'],
            project_properties: propertiesPayload,
            project_metadata: state.properties?.['project_metadata'],
        };
    }

    // TODO: Refactor project state to linear structure
    private updatePropertiesOnTabChange(state) {
        const updatedProperties = this.getUpdatedForm();
        this.projectService.setPropertiesState({
            ...state,
            properties: {
                ...state.properties,
                project_properties: {
                    ...state.properties?.project_properties,
                    brand_id: updatedProperties.brand?.id ?? state.properties.project_properties?.['brand_id'],
                    project_type:
                        updatedProperties.project_type.id ?? state.properties.project_properties?.['project_type'],
                    placeholder:
                        updatedProperties.mainDefinitionPlaceHolder ??
                        state.properties.project_properties?.['placeholder'],
                    due_date: updatedProperties.finalDelivery ?? state.properties.project_properties?.['due_date'],
                    description: updatedProperties.description ?? state.properties.project_properties?.['description'],
                    title: updatedProperties.projectName ?? state.properties.project_properties?.['title'],
                    isProjectUpdateInProgress: true,
                },
            },
        });
    }

    nextTab(): void {
        if (this.propertiesForm.invalid) {
            return;
        }

        this.projectService.setlangPropertiesState(this.getUpdatedForm());
        this.projectPropertiesService.setState(2);
    }
}
