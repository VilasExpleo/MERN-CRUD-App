import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { DuplicateTextValidator } from 'src/app/core/async-validators/duplicate-text-validator.validator';
import { NoWhiteSpaceValidator } from 'src/app/core/async-validators/no-white-space.validator';
import { EditableTextModel } from '../../editable-list/editable-list.model';
@Component({
    selector: 'app-add-text',
    templateUrl: './add-text.component.html',
})
export class AddTextComponent implements OnInit {
    @Input()
    hidePlusAction: boolean;

    @Input()
    list$: Observable<EditableTextModel[]>;

    @Input()
    selectedText: string;

    @Input()
    duplicateCheckCount: number;

    @Input()
    attributeName: string;

    @Input()
    placeholder: string;

    @Input()
    enableSearch: boolean;

    @Input()
    duplicateValidation: boolean;

    @Input()
    buttonLabel: string;

    @Input()
    selectedRow: EditableTextModel;

    @Output() addEvent = new EventEmitter<string>();

    @Output() deleteAllEvent = new EventEmitter<void>();

    addForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private confirmationService: ConfirmationService) {}

    private initializeForm() {
        this.addForm = this.formBuilder.group({
            text: [this.selectedText, [Validators.required, Validators.maxLength(500)]],
        });
    }

    ngOnInit(): void {
        this.initializeForm();
        this.list$?.subscribe((list) => {
            const texts = list.map((text) => text.text);
            if (this.duplicateValidation) {
                this.text?.setAsyncValidators(
                    Validators.composeAsync([DuplicateTextValidator.validate(texts), NoWhiteSpaceValidator.validate()])
                );
                this.text?.updateValueAndValidity();
            }
        });
    }

    get text() {
        return this.addForm?.get('text');
    }

    isMandatoryField(controlName: string): boolean {
        return this.addForm.controls[controlName]?.errors?.['required'];
    }

    isDuplicate(controlName: string) {
        return this.addForm.controls[controlName]?.errors?.['duplicate'];
    }

    isNoWhiteSpace(controlName: string) {
        return this.addForm.controls[controlName]?.errors?.['leadingSpaces'];
    }

    isMaxLength(controlName: string): boolean {
        return (
            this.addForm.controls[controlName]?.errors?.['maxlength']?.requiredLength <
            this.addForm.controls[controlName]?.errors?.['maxlength']?.actualLength
        );
    }

    addText() {
        if (this.addForm.valid) {
            this.addEvent.emit(this.text.value);
            this.addForm.reset();
            this.initializeForm();
        }
    }

    deleteAllText() {
        this.deleteAllEvent.emit();
        this.addForm.reset();
    }
}
