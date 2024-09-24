import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ManageRawProjectService } from '../../../../../core/services/data-creator/manage-raw-project.service';
import { RawProjectService } from '../../../../../core/services/data-creator/raw-project.service';
import { SortingService } from '../../../../../core/services/sort/sorting.service';
import { HmiMessageService } from '../../../../../core/services/toast/hmi-message.service';
import { UseCaseEnum } from '../../../../../shared/enums/use-case.enum';
import {
    FontPackageModel,
    LengthCalculationModel,
    ManageRawProjectStateModel,
    PlaceholderModel,
} from '../manage-raw-project-state.model';
import { ManageRawProjectVerificationStepModel } from './manage-raw-project-verification-step.model';

@Component({
    selector: 'app-manage-raw-project-verification',
    templateUrl: './manage-raw-project-verification.component.html',
})
export class ManageRawProjectVerificationComponent implements OnInit {
    stepControl = {
        index: 2,
        nextStep: null,
        previousStep: 1,
    };

    model: ManageRawProjectStateModel = this.manageRawProjectService.getInitialState();

    UseCase = UseCaseEnum;

    @Output() navigationEvent = new EventEmitter<number>();
    @Output() closeEvent = new EventEmitter<boolean>();
    @Output() loadingChange = new EventEmitter<boolean>(true);

    @Output()
    updateEvent = new EventEmitter();

    formGroup: FormGroup = this.initializeForm();

    @ViewChild('fontInput')
    fontInput: ElementRef;
    selectedFontPackage: FontPackageModel;

    @ViewChild('customPlaceholderSymbol')
    customPlaceholderSymbol: ElementRef;
    customPlaceholderValidationErrors: string[] = [];

    @ViewChild('lengthCalculationInput')
    lengthCalculationInput: ElementRef;
    selectedLengthCalculation: LengthCalculationModel;

    constructor(
        private rawProjectService: RawProjectService,
        private formBuilder: FormBuilder,
        private manageRawProjectService: ManageRawProjectService,
        private sortingService: SortingService,
        private hmiMessageService: HmiMessageService
    ) {}

    ngOnInit(): void {
        this.setLoading(true);

        this.manageRawProjectService.getDataForStepVerification().subscribe({
            next: (response: ManageRawProjectVerificationStepModel) => {
                if (response) {
                    this.setViewModelAndUpdateForm(response.model);
                    this.setAvailableFonts(response.fontPackages);
                    this.setAvailableLengthCalculations(response.lengthCalculations);
                }

                this.setLoading(false);
            },
        });
    }

    private setLoading(value: boolean) {
        this.loadingChange.emit(value);
    }

    private initializeForm() {
        return this.formBuilder.group({
            placeholders: this.formBuilder.array([]),
            fontPackages: this.formBuilder.array([]),
            lengthCalculations: this.formBuilder.array([]),
            selectedFontPackage: this.selectedFontPackage,
            selectedLengthCalculation: this.selectedLengthCalculation,
            fontPackage: [this.model.rawProject.fontPackage],
        });
    }

    navigateToNextStep(stepIndex: number) {
        this.updateModelWithFormValues();
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.navigationEvent.emit(stepIndex);
    }

    previousStep() {
        this.navigateToNextStep(this.stepControl.previousStep);
    }

    nextStep() {
        this.navigateToNextStep(this.stepControl.nextStep);
    }

    get placeholders(): FormArray {
        return this.formGroup.controls['placeholders'] as FormArray;
    }

    get fontPackageFormControls(): FormArray {
        return this.formGroup.controls['fontPackages'] as FormArray;
    }

    get lengthCalculationFormControls(): FormArray {
        return this.formGroup.controls['lengthCalculations'] as FormArray;
    }

    get formControlSelectedFontPackages(): FormControl {
        return this.formGroup.get('selectedFontPackage') as FormControl;
    }

    get formControlSelectedLengthCalculation(): FormControl {
        return this.formGroup.get('selectedLengthCalculation') as FormControl;
    }

    get formControlSelectedFontPackage(): FormControl {
        return this.formGroup.get('fontPackage') as FormControl;
    }

    private updateModelWithFormValues() {
        const form = this.formGroup.value;

        this.model.rawProject.placeholders = form.placeholders;
        this.model.rawProject.fontPackages = this.model.availableOptions.fontPackages.filter(
            (fontPackage) => fontPackage.id === form.fontPackage
        );
        this.model.rawProject.lengthCalculations = form.lengthCalculations;
        this.model.rawProject.fontPackage = this.model.availableOptions.fontPackages.filter(
            (fontPackage) => fontPackage.id === form.fontPackage
        )[0];
    }

    private updateFormWithModel() {
        this.setPlaceholders(this.model.rawProject.placeholders);
        this.setFontPackages(this.model.rawProject.fontPackages);
        this.setLengthCalculations(this.model.rawProject.lengthCalculations);
        const form = this.formGroup.value;
        form.fontPackage = this.model.rawProject.fontPackages[0]?.id || 0;
        this.formGroup.patchValue(form);
    }

    onCreateProject() {
        this.updateModelWithFormValues();
        if (this.formGroup.invalid) {
            this.hmiMessageService.showError({
                detail: 'Project data not valid. Please resolve the errors to continue.',
            });

            return;
        }

        this.rawProjectService
            .createRawProject(this.model.rawProject)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response) => {
                    this.hmiMessageService.handleResponseOnDialogClose(
                        !!response.id,
                        'Project',
                        'Project created successfully',
                        'Failed to create Project'
                    );

                    this.closeEvent.emit(false);
                },
            });
    }

    cancel() {
        this.closeEvent.emit(true);
    }

    // === section: font packages ===

    //adds entries to the area of selected fonts
    private setFontPackages(fontPackages: FontPackageModel[]) {
        const uniqueNames = [];

        fontPackages.forEach((fontPackage: FontPackageModel) => {
            const name = fontPackage.name.trim();

            if (uniqueNames[name] === undefined) {
                const group = this.formBuilder.group({
                    id: fontPackage.id,
                    name: name,
                    isDefault: fontPackage.isDefault,
                    canDelete: true,
                    isSelected: true,
                });

                this.fontPackageFormControls.push(group);
                uniqueNames[name] = '';
            }
        });

        this.fontPackageFormControls.controls = this.sortingService.sortFormControlByProperty(
            this.fontPackageFormControls.controls,
            'name'
        );
    }

    //adds the selected value of the dropdown to the area of selected items and removes the option from the dropdown
    moveFontFromAvailableToSelected(fontId: number) {
        const font = this.model.availableOptions.fontPackages.find((font) => font.id === fontId);
        if (font) {
            this.setFontPackages([font]);
            this.removeFontFromAvailableOptions(font.id);
        }
    }

    private removeFontFromAvailableOptions(fontId: number) {
        const index = this.model.availableOptions.fontPackages.findIndex((font) => font.id === fontId);
        if (index > -1) {
            this.model.availableOptions.fontPackages.splice(index, 1);
        }

        this.formControlSelectedFontPackages.reset();
    }

    //ensures only the last activated font isDefault=true
    fontPackagesCheckBoxChange(index: number) {
        const fontPackage = this.fontPackageFormControls.value[index];
        if (!fontPackage.isDefault) {
            return;
        }

        this.fontPackageFormControls.controls.forEach((el, key) => {
            if (key === index) {
                return;
            }
            if (this.fontPackageFormControls.value[key].isDefault !== true) {
                return;
            }

            const item = {
                id: this.fontPackageFormControls.value[key].id,
                name: this.fontPackageFormControls.value[key].name,
                isDefault: false,
                canDelete: true,
            };
            this.fontPackageFormControls.removeAt(key);

            const customFontPackagesGroup = this.formBuilder.group(item);
            this.fontPackageFormControls.insert(key, customFontPackagesGroup);
        });
    }

    //removes the items from the area of selected items and adds it as an option to the dropdown
    moveFontFromSelectedToAvailable(index: number) {
        const font = this.fontPackageFormControls.value[index];
        const item: FontPackageModel = {
            id: font.id,
            name: font.name,
            isDefault: false,
        };
        this.model.availableOptions.fontPackages.push(item);
        this.fontPackageFormControls.removeAt(index);
        this.model.availableOptions.fontPackages = this.sortingService.sortByProperty(
            this.model.availableOptions.fontPackages,
            'name'
        );
    }

    //LBE:: will be implemented in HMIL-88 Edit Project
    showWarningOnFontPackageToggle() {
        // this.confirmationService.confirm({
        //     message: `You are about to make changes to attributes of the project,
        //         that will lead to a mass operation and recalculation of all project texts.
        //         This message will not be shown again during the current session.`,
        //     header: 'Warning',
        //     icon: 'pi pi-exclamation-triangle',
        //     acceptLabel: 'okay',
        //     rejectVisible: false,
        //     acceptButtonStyleClass: 'mt-3',
        //     // accept: () => this.localStorageService.set('togglePlaceholder', true),
        // });
    }

    // === section: length calculation ===
    //adds entries to the area of selected fonts
    private setLengthCalculations(lengthCalculations: LengthCalculationModel[]) {
        const uniqueNames = [];
        lengthCalculations.forEach((lengthCalculation: LengthCalculationModel) => {
            const name = lengthCalculation.name.trim();

            if (uniqueNames[name] === undefined) {
                const group = this.formBuilder.group({
                    id: lengthCalculation.id,
                    name: name,
                    isDefault: lengthCalculation.isDefault,
                    canDelete: true,
                });

                this.lengthCalculationFormControls.push(group);
                uniqueNames[name] = '';
            }
        });
        this.lengthCalculationFormControls.controls = this.sortingService.sortFormControlByProperty(
            this.lengthCalculationFormControls.controls,
            'name'
        );
    }

    //adds the selected value of the dropdown to the area of selected items and removes the option from the dropdown
    moveLengthCalculationFromAvailableToSelected(itemId: number) {
        const entry = this.model.availableOptions.lengthCalculations.find(
            (lengthCalculation) => lengthCalculation.id === itemId
        );
        if (entry) {
            this.setLengthCalculations([entry]);
            this.removeLengthCalculationFromAvailableOptions(entry.id);
        }
    }

    private removeLengthCalculationFromAvailableOptions(lengthCalculationId: number) {
        const index = this.model.availableOptions.lengthCalculations.findIndex(
            (element) => element.id === lengthCalculationId
        );
        if (index > -1) {
            this.model.availableOptions.lengthCalculations.splice(index, 1);
        }

        this.formControlSelectedLengthCalculation.reset();
    }

    //ensures only the last activated font isDefault=true
    lengthCalculationCheckBoxChange(index: number) {
        const lengthCalculation = this.lengthCalculationFormControls.value[index];
        if (!lengthCalculation.isDefault) {
            return;
        }

        this.lengthCalculationFormControls.controls.forEach((element, key) => {
            if (key === index) {
                return;
            }
            if (this.lengthCalculationFormControls.value[key].isDefault !== true) {
                return;
            }

            const item = {
                id: this.lengthCalculationFormControls.value[key].id,
                name: this.lengthCalculationFormControls.value[key].name,
                isDefault: false,
                canDelete: true,
            };
            this.lengthCalculationFormControls.removeAt(key);

            const group = this.formBuilder.group(item);
            this.lengthCalculationFormControls.insert(key, group);
        });
    }

    //removes the items from the area of selected items and adds it as an option to the dropdown
    moveLengthCalculationFromSelectedToAvailable(index: number) {
        const lengthCalculation = this.lengthCalculationFormControls.value[index];
        const item: LengthCalculationModel = {
            id: lengthCalculation.id,
            name: lengthCalculation.name,
            isDefault: false,
        };
        this.model.availableOptions.lengthCalculations.push(item);

        this.model.availableOptions.lengthCalculations = this.sortingService.sortByProperty(
            this.model.availableOptions.lengthCalculations,
            'name'
        );

        this.lengthCalculationFormControls.removeAt(index);
    }

    //LBE:will be implemented in HMIL-88 Edit Project
    showWarningOnLengthCalculationToggle() {
        // this.confirmationService.confirm({
        //     message: `You are about to make changes to attributes of the project,
        //         that will lead to a mass operation and recalculation of all project texts.
        //         This message will not be shown again during the current session.`,
        //     header: 'Warning',
        //     icon: 'pi pi-exclamation-triangle',
        //     acceptLabel: 'okay',
        //     rejectVisible: false,
        //     acceptButtonStyleClass: 'mt-3',
        //     // accept: () => this.localStorageService.set('togglePlaceholder', true),
        // });
    }

    // === section: placeholder ===
    removePlaceholderSymbol(symbol: string) {
        this.removePlaceholder(symbol);
    }

    //LBE:will be implemented in HMIL-88 Edit Project
    showWarningOnPlaceholderToggle() {
        // this.confirmationService.confirm({
        //   message: `You are about to make changes to attributes of the project,
        //         that will lead to a mass operation and recalculation of all project texts.
        //         This message will not be shown again during the current session.`,
        //   header: 'Warning',
        //   icon: 'pi pi-exclamation-triangle',
        //   acceptLabel: 'okay',
        //   rejectVisible: false,
        //   acceptButtonStyleClass: 'mt-3',
        //   accept: () => this.localStorageService.set('togglePlaceholder', true),
        // });
    }

    private removePlaceholder(symbol: string) {
        const index = this.placeholders.controls.findIndex(
            (placeholderControl) => placeholderControl.value.symbol === symbol
        );
        this.placeholders.removeAt(index);
    }

    confirmAndAddPlaceholder(symbol: string) {
        symbol = symbol.trim();
        if (this.isInvalidPlaceholderSymbol(symbol)) {
            this.customPlaceholderSymbol.nativeElement.value = symbol;
            return;
        }

        this.customPlaceholderSymbol.nativeElement.value = '';

        this.addPlaceholder(symbol);
    }

    private addPlaceholder(symbol: string) {
        const placeholder = { symbol, isActive: true, canDelete: true };
        const customPlaceholderGroup = this.formBuilder.group(placeholder);

        this.placeholders.insert(0, customPlaceholderGroup);
        this.placeholders.controls = this.sortingService.sortFormControlByProperty(
            this.placeholders.controls,
            'symbol'
        );
    }

    private isInvalidPlaceholderSymbol(symbol: string): boolean {
        this.customPlaceholderValidationErrors = [];
        if (symbol.length < 2) {
            this.customPlaceholderValidationErrors.push('Custom placeholder should have min 2 characters');
            return true;
        }

        const parts = symbol.split('n');
        if (parts.length != 2) {
            this.customPlaceholderValidationErrors.push('custom placeholder should contain exactly one "n"');
            return true;
        }

        const isExist = !!this.placeholders.controls.find(
            (placeholderControl) => placeholderControl.value.symbol.trim() === symbol
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

    getCustomPlaceholderValidationErrors(): string[] {
        return this.customPlaceholderValidationErrors;
    }

    private setPlaceholders(placeholders: PlaceholderModel[]) {
        const uniqueSymbols = [];

        placeholders.forEach((placeholder: PlaceholderModel) => {
            const symbol = placeholder.symbol.trim();

            if (uniqueSymbols[symbol] === undefined) {
                const group = this.formBuilder.group({
                    id: placeholder.id,
                    symbol: symbol,
                    canDelete: placeholder.canDelete,
                });

                this.placeholders.push(group);
                uniqueSymbols[symbol] = '';
            }
        });
    }

    private setViewModelAndUpdateForm(model) {
        this.model = model;

        if (this.model.rawProject.placeholders.length) {
            this.model.rawProject.placeholders = this.sortingService.sortByProperty(
                this.model.rawProject.placeholders,
                'symbol'
            );
        }
        if (this.model.rawProject.fontPackages.length) {
            this.model.rawProject.fontPackages = this.sortingService.sortByProperty(
                this.model.rawProject.fontPackages,
                'name'
            );
        }
        if (this.model.rawProject.lengthCalculations.length) {
            this.model.rawProject.lengthCalculations = this.sortingService.sortByProperty(
                this.model.rawProject.lengthCalculations,
                'name'
            );
        }

        this.updateFormWithModel();
    }

    private setAvailableFonts(fontPackages: FontPackageModel[]) {
        this.model.availableOptions.fontPackages = this.sortingService.sortByProperty(fontPackages, 'name');
    }

    private setAvailableLengthCalculations(lengthCalculations: LengthCalculationModel[]) {
        if (lengthCalculations) {
            this.model.availableOptions.lengthCalculations = this.sortingService.sortByProperty(
                lengthCalculations,
                'name'
            );
        }
        if (this.model.rawProject.lengthCalculations.length) {
            this.model.rawProject.lengthCalculations.forEach((selectedLengthCalculation) => {
                const index = this.model.availableOptions.lengthCalculations.findIndex(
                    (lengthCalculations) => lengthCalculations.id === selectedLengthCalculation.id
                );
                if (index > -1) {
                    this.model.availableOptions.lengthCalculations.splice(index, 1);
                }
            });
        }
    }

    updateProjectDetails() {
        this.updateModelWithFormValues();
        this.manageRawProjectService.setManageRawProjectModel(this.model);
        this.updateEvent.emit();
    }
}
