import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RawProjectCheckUniquePropertiesValidatorModel } from '../../../../../core/async-validators/raw-project-check-unique-properties-validator.model';
import { RawProjectNameValidator } from '../../../../../core/async-validators/raw-project-name-validator';
import { RawProjectXmlIdValidator } from '../../../../../core/async-validators/raw-project-xml-id-validator';
import { ManageRawProjectService } from '../../../../../core/services/data-creator/manage-raw-project.service';
import { RawProjectService } from '../../../../../core/services/data-creator/raw-project.service';
import { SortingService } from '../../../../../core/services/sort/sorting.service';
import { UseCaseEnum } from '../../../../../shared/enums/use-case.enum';
import { ManageRawProjectStateModel, VariantModel } from '../manage-raw-project-state.model';
import { ManageRawProjectDetailsStepModel } from './manage-raw-project-details-step.model';

@Component({
    selector: 'app-manage-raw-project-details',
    templateUrl: './manage-raw-project-details.component.html',
})
export class ManageRawProjectDetailsComponent implements OnInit {
    UseCase = UseCaseEnum;

    model: ManageRawProjectStateModel = this.manageRawProjectService.getInitialState();
    @Output() updateEvent = new EventEmitter();
    @Output() navigationEvent = new EventEmitter<number>();
    @Output() closeEvent = new EventEmitter<boolean>();
    @Output() loadingChange = new EventEmitter<boolean>(true);

    stepControl = {
        index: 0,
        nextStep: 1,
        previousStep: null,
    };

    formGroup: FormGroup = this.initializeForm();
    @ViewChild('variantInput')
    variantInput: ElementRef;
    variantInputValidationErrors: string[] = [];

    constructor(
        private rawProjectService: RawProjectService,
        private formBuilder: FormBuilder,
        private manageRawProjectService: ManageRawProjectService,
        private sortingService: SortingService
    ) {}

    ngOnInit(): void {
        this.addValidatorsOnProjectName();
        this.addValidatorsOnProjectXmlId();

        this.setLoading(true);
        this.manageRawProjectService.getDataForStepProjectDetails().subscribe({
            next: (response: ManageRawProjectDetailsStepModel) => {
                if (response) {
                    this.setViewModelAndUpdateForm(response.model);
                    this.model.availableOptions.projectTypes = response.projectTypes;
                }
                this.setLoading(false);
            },
        });
    }

    navigateToStep(stepIndex: number) {
        this.updateModelWithFormValues();
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.navigationEvent.emit(stepIndex);
    }

    nextStep() {
        if (!this.hasVariantListADefaultVariant()) {
            return;
        }
        if (this.formGroup.invalid && this.model.useCase === UseCaseEnum.Create) {
            return;
        }

        this.navigateToStep(this.stepControl.nextStep);
    }

    previousStep() {
        this.navigateToStep(this.stepControl.previousStep);
    }

    cancel() {
        this.closeEvent.emit(true);
    }

    get variantFormControls(): FormArray {
        return this.formGroup.controls['variants'] as FormArray;
    }

    get projectName(): FormControl {
        return this.formGroup.get('projectName') as FormControl;
    }
    get projectXmlId(): FormControl {
        return this.formGroup.get('projectXmlId') as FormControl;
    }

    get projectDescription(): AbstractControl<any, any> {
        return this.formGroup.controls['description'];
    }

    get projectType(): AbstractControl<any, any> {
        return this.formGroup.controls['projectType'];
    }

    private setLoading(value: boolean) {
        this.loadingChange.emit(value);
    }

    private initializeForm() {
        return this.formBuilder.group({
            projectName: [this.model.rawProject.projectName, [Validators.required]],
            projectXmlId: [this.model.rawProject.projectXmlId, [Validators.required]],
            projectType: [this.model.rawProject.projectType, [Validators.required]],
            description: [this.model.rawProject.description],
            variants: this.formBuilder.array([]),
        });
    }

    private updateModelWithFormValues() {
        const form = this.formGroup.value;
        this.model.rawProject.projectName = form.projectName;
        this.model.rawProject.projectXmlId = form.projectXmlId;
        this.model.rawProject.projectType = form.projectType;
        this.model.rawProject.description = form.description;
        this.model.rawProject.variants = form.variants;
    }

    private updateFormWithModel() {
        const form = this.formGroup.value;
        form.projectName = this.model.rawProject.projectName;
        form.projectXmlId = this.model.rawProject.projectXmlId;
        form.projectType = this.model.rawProject.projectType;
        form.description = this.model.rawProject.description;
        this.formGroup.patchValue(form);

        this.setVariants(this.model.rawProject.variants);
    }

    // === section: variants ===
    validateAndAddItem(name: string) {
        name = name.trim();
        if (this.isInvalidName(name)) {
            this.variantInput.nativeElement.value = name;
            return;
        }

        this.variantInput.nativeElement.value = '';

        this.addItem(name);
    }

    private isInvalidName(name: string): boolean {
        this.variantInputValidationErrors = [];
        if (name.trim().length < 1) {
            this.variantInputValidationErrors.push('A variant should have min. 1 character.');
            return true;
        }

        const isExist = !!this.variantFormControls.controls.find(
            (controlItem) => controlItem.value.name.trim() === name.trim()
        );

        if (isExist) {
            this.variantInputValidationErrors.push('A variant with that name already exists.');
        }

        return isExist;
    }

    private hasVariantListADefaultVariant(): boolean {
        this.variantInputValidationErrors = [];

        let isValid = true;
        if (this.variantFormControls.controls.length) {
            isValid = !!this.variantFormControls.controls.find((controlItem) => controlItem.value.isDefault === true);
        }

        if (!isValid) {
            this.variantInputValidationErrors.push('A default variant has to be selected');
        }

        return isValid;
    }

    private addItem(name: string) {
        const item = { name: name, isDefault: false, canDelete: true };
        const customVariantGroup = this.formBuilder.group(item);

        this.variantFormControls.insert(0, customVariantGroup);
        this.variantFormControls.controls = this.sortingService.sortFormControlByProperty(
            this.variantFormControls.controls,
            'name'
        );
        this.hasVariantListADefaultVariant();
    }

    removeItemByName(name: string) {
        const index = this.variantFormControls.controls.findIndex((controlItem) => controlItem.value.name === name);
        this.variantFormControls.removeAt(index);
        this.hasVariantListADefaultVariant();
    }

    private setVariants(variants: VariantModel[]) {
        const uniqueNames = [];

        variants.forEach((variant: VariantModel) => {
            const name = variant.name.trim();
            if (uniqueNames[name] === undefined) {
                const group = this.formBuilder.group({
                    id: variant.id,
                    name: variant.name,
                    isDefault: variant.isDefault,
                    canDelete: true,
                });

                this.variantFormControls.push(group);
                uniqueNames[name] = '';
            }
        });
    }

    //ensures only the last activated variant isDefault=true
    variantCheckBoxChange(index: number) {
        const variant = this.variantFormControls.value[index];
        if (variant.isDefault) {
            this.variantFormControls.controls.forEach((element, key) => {
                if (key === index) {
                    return;
                }
                if (this.variantFormControls.value[key].isDefault !== true) {
                    return;
                }

                const item = {
                    id: this.variantFormControls.value[key].id,
                    name: this.variantFormControls.value[key].name,
                    isDefault: false,
                    canDelete: true,
                };
                this.variantFormControls.removeAt(key);

                const group = this.formBuilder.group(item);
                this.variantFormControls.insert(key, group);
            });
        }

        this.hasVariantListADefaultVariant();
    }

    showWarningOnVariantToggle() {
        return; //"will be implement in HMIL-88"
    }

    getVariantInputValidationErrors() {
        return this.variantInputValidationErrors;
    }

    private addValidatorsOnProjectName() {
        this.projectName.addValidators([
            Validators.required,
            Validators.pattern('[ A-Za-z0-9_-]*'),
            Validators.minLength(3),
        ]);

        const validatorModel: RawProjectCheckUniquePropertiesValidatorModel = {
            projectId: this.model.rawProject.id,
            projectName: this.model.rawProject.projectName,
            useCase: this.model.useCase,
        };

        this.projectName.addAsyncValidators(
            RawProjectNameValidator.createValidator(this.rawProjectService, validatorModel)
        );

        this.projectName.updateValueAndValidity();
    }

    private addValidatorsOnProjectXmlId() {
        this.projectXmlId.addValidators([
            Validators.required,
            Validators.pattern('[ A-Za-z0-9_-]*'),
            Validators.minLength(3),
        ]);

        const validatorModel: RawProjectCheckUniquePropertiesValidatorModel = {
            projectId: this.model.rawProject.id,
            projectXmlId: this.model.rawProject.projectXmlId,
            useCase: this.model.useCase,
        };

        this.projectXmlId.addAsyncValidators(
            RawProjectXmlIdValidator.createValidator(this.rawProjectService, validatorModel)
        );

        this.projectXmlId.updateValueAndValidity();
    }

    private setViewModelAndUpdateForm(model) {
        this.model = model;

        if (model.rawProject.placeholders.variants) {
            this.model.rawProject.variants = this.sortingService.sortByProperty(model.rawProject.variants, 'name');
        }

        this.updateFormWithModel();
    }

    updateProjectDetails() {
        if (!this.hasVariantListADefaultVariant()) {
            return;
        }
        this.updateModelWithFormValues();
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.updateEvent.emit();
    }
}
