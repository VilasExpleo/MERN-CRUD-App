import { Component, Input, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LabelsService } from 'src/app/core/services/labels/labels.service';
import { LabelFormModel, LabelOptionsModel } from './label-form.model';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { LabelModel } from '../label.model';
import { LabelResponseModel } from 'src/app/shared/models/labels/label-response.model';
@Component({
    selector: 'app-label-form',
    templateUrl: './label-form.component.html',
})
export class CreateLabelComponent implements OnInit {
    @Input()
    projectId: number;

    @Input() labels: LabelModel[];

    @Input()
    readonly title = `Enter the properties of your new label. Select a descriptive name and choose a unique color and add an icon to
    make your label even more distinguishable. By adding a restriction, you can check your text for certain
    characteristics or syntax. Add a postpone date for texts which are still undergoing changes and should not yet
    be translated. Adding a bugfix flag can help you tracking texts affected by technical issues.`;

    @Output()
    showGridEvent = new EventEmitter<boolean>();

    createLabelForm: FormGroup;
    options$: Observable<LabelOptionsModel>;
    color = '';
    date: Date | undefined;
    minDate: Date | undefined;
    isUpdate = false;
    labelId: number;

    constructor(private readonly formBuilder: FormBuilder, private readonly labelService: LabelsService) {}

    ngOnInit(): void {
        this.initializeFormValues();
        this.initializeCreateLabelForm();
        this.handleRestrictionChanges();
        this.initializeFormValues();
        this.setMinimumDate();
        this.handleColorValueChanges();
    }

    ngAfterViewInit(): void {
        this.handleSelectedLabel();
    }

    backToLabelList() {
        this.showGridEvent.emit(false);
        this.labelService.resetState();
    }

    onSubmit() {
        this.isUpdate ? this.updateLabel() : this.createLabel();
    }

    handleUniqueLabelValidation(): void {
        const labelName = this.createLabelForm.get('name');
        if (this.labels.filter((label: LabelModel) => label.name === labelName.value).length > 0) {
            labelName.setErrors({ unique: true });
        } else {
            labelName.setErrors(null);
        }
    }

    private createLabel() {
        this.labelService
            .createLabels(this.projectId, this.getPayload())
            .subscribe((response: ApiBaseResponseModel) => {
                this.handleBackToLabelList(response);
            });
    }

    private updateLabel() {
        this.labelService
            .updateLabel(this.projectId, this.labelId, this.getPayload())
            .subscribe((response: ApiBaseResponseModel) => {
                this.handleBackToLabelList(response);
            });
    }

    private initializeCreateLabelForm(): void {
        this.createLabelForm = this.formBuilder.group({
            name: new FormControl('', [Validators.required]),
            attachTo: new FormControl({ value: ['GroupNode', 'TextNode', 'Translation'], disabled: false }, [
                Validators.required,
            ]),
            color: new FormControl(''),
            restriction: new FormControl(''),
            restrictionPattern: new FormControl({ value: '', disabled: true }),
            date: new FormControl(''),
            icon: new FormControl(''),
            isBugfix: new FormControl(null),
        });
    }

    private handleRestrictionChanges(): void {
        const restrictionPattern = this.createLabelForm.get('restrictionPattern');
        this.createLabelForm.get('restriction').valueChanges.subscribe((value: string) => {
            if (value === 'RegExp') {
                restrictionPattern.enable();
                restrictionPattern.addValidators([Validators.required]);
            } else {
                restrictionPattern.disable();
                restrictionPattern.clearValidators();
            }
            restrictionPattern.updateValueAndValidity();
        });
    }

    private initializeFormValues(): void {
        this.options$ = this.labelService.getFormOptions();
    }

    private setMinimumDate(): void {
        const date = new Date();
        this.minDate = new Date(date.setDate(date.getDate() + 1));
    }

    private handleBackToLabelList(response: ApiBaseResponseModel): void {
        if (response?.status === ResponseStatusEnum.OK) {
            this.backToLabelList();
        }
    }

    private handleColorValueChanges() {
        this.createLabelForm.get('color').valueChanges.subscribe((value: string) => {
            this.color = value;
        });
    }

    private handleSelectedLabel() {
        this.labelService.getSelectedLabel().subscribe((selectedLabel) => {
            if (selectedLabel) {
                this.updateFormDetails(selectedLabel);
            } else {
                this.isUpdate = false;
            }
        });
    }

    private updateFormDetails(selectedLabel: LabelModel): void {
        this.labelId = selectedLabel.id;
        this.isUpdate = true;
        const label = this.convertLabelModelToResponseModel(selectedLabel);
        if (label?.date) {
            this.date = new Date(label.date);
        }
        this.createLabelForm.patchValue(label);
        this.createLabelForm.updateValueAndValidity();
    }

    private convertLabelModelToResponseModel(selectedLabel: LabelModel): LabelResponseModel {
        return {
            ...selectedLabel,
            attachTo: selectedLabel.attachTo.split(','),
            isBugfix: selectedLabel.bugFix === 'Yes',
        };
    }

    private getPayload(): LabelFormModel {
        const formValue: LabelFormModel = this.createLabelForm.value;
        const date = new Date(formValue.date);
        return formValue?.date ? { ...formValue, date: this.getDateWithoutTimeZoneOffset(date) } : formValue;
    }

    private getDateWithoutTimeZoneOffset(date: Date): string {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
    }
}
