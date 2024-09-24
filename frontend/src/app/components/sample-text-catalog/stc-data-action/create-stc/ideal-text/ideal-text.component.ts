import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    Output,
    QueryList,
    Renderer2,
    ViewChildren,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { Status } from 'src/Enumerations';
import { iconBaseUrl } from '../../../../../shared/config/config';
import { IidelTextTabList } from './idelTextTabList';
import { stcTextDesc } from 'src/app/shared/models/patterns';
@Component({
    selector: 'app-ideal-text',
    templateUrl: './ideal-text.component.html',
    styleUrls: ['./ideal-text.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IdealTextComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => IdealTextComponent),
            multi: true,
        },
        ConfirmationService,
        MessageService,
    ],
})
export class IdealTextComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    BaseUrl: string = iconBaseUrl;
    sub: Subscription[] = [];
    deletedIdealText: any = [];
    @Input() submitSTC = false;
    @Input() disabled = false;
    ifSortFormExsit = false;
    ifIdealTextChanged = false;
    selectedTabIndex = 0;
    sameLengthShortForm = false;
    @Output() checkIfAnyError: EventEmitter<any> = new EventEmitter();
    statusIcon = Status;
    @ViewChildren('idealTextAreaElement', { read: ElementRef }) idealTextAreaElement: QueryList<ElementRef>;

    subscription: any;
    constructor(
        private formBuilder: UntypedFormBuilder,
        private changeDetect: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private eventBus: NgEventBus,
        public objSampleTextCatalogService: SampleTextCatalogService,
        private renderer: Renderer2
    ) {
        this.objSampleTextCatalogService.idealTextFG = this.formBuilder.group({
            idealTextRow: this.formBuilder.array([]),
        });
        this.sub.push(
            this.objSampleTextCatalogService.idealTextFG.valueChanges.subscribe((value) => {
                this.onChange(value);
                this.onTouched();
            })
        );
    }

    //----------------------Control value accessor---------------------
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: any = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTouched: any = () => {};
    get value(): IidelTextTabList[] {
        return this.objSampleTextCatalogService.idealTextFG.value;
    }
    set value(value: IidelTextTabList[]) {
        value['idealTextRow'].map((deccRow, index) => {
            this.objSampleTextCatalogService.getIdelTextTabList.push(this.initiateSTCFromForEdit(deccRow));
            if (deccRow.enable) {
                this.objSampleTextCatalogService.getIdelTextTabList['controls'][index]['controls'][
                    'idealText'
                ].disable();
            } else {
                this.objSampleTextCatalogService.getIdelTextTabList['controls'][index]['controls'][
                    'idealText'
                ].enable();
            }
        });

        this.onChange(value);
        this.onTouched();
        this.changeDetect.detectChanges();
        if (this.objSampleTextCatalogService.getIdelTextTabList?.value?.length > 0) {
            this.objSampleTextCatalogService.selectedIdealTextShortFromData =
                this.objSampleTextCatalogService.getIdelTextTabList.value[0];
        }
    }
    writeValue(obj: any): void {
        this.resetValidation();
        if (obj) {
            if (this.objSampleTextCatalogService.getIdelTextTabList.value.length > 0) {
                this.objSampleTextCatalogService.getIdelTextTabList.value.map(() => {
                    this.objSampleTextCatalogService.getIdelTextTabList.removeAt(0);
                });
            }
            this.objSampleTextCatalogService.getIdelTextTabList.removeAt(this.selectedTabIndex);
            this.selectedTabIndex = 0;
            this.value = obj;
        }
    }
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }
    registerOnChange(fn: any) {
        this.onChange = fn;
    }
    ngOnDestroy() {
        this.sub.forEach((s) => s.unsubscribe());
        this.subscription && this.subscription.unsubscribe();
    }
    // Allows Angular to disable the input.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //------------------------------------------------------------------
    addNewIdealTextTab() {
        if (!this.sameLengthShortForm && !this.ifSortFormExsit) {
            if (
                this.objSampleTextCatalogService.idealTextFG.valid &&
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value[0].idealText != ''
            ) {
                this.submitSTC = false;
                this.objSampleTextCatalogService.afterAddChangeSelectedIndex();
                const obj: any = {
                    idealText: '',
                    header: 'Shortform' + this.objSampleTextCatalogService.getIdelTextTabList.length,
                    selected: true,
                    maxLength: [
                        this.objSampleTextCatalogService.getIdelTextTabList.controls[0].value.idealText.length - 1,
                    ],
                    id: 0,
                    enable: false,
                    sameLengthFlag: false,
                    minlength: 0,
                    idealTextChanged: 0,
                    orignalIdealText: '',
                    status: 'Work in Progress',
                    stc_id: 0,
                };
                const from = this.initiateSTCFromForEdit(obj);
                const control = this.objSampleTextCatalogService.idealTextFG.get('idealTextRow') as UntypedFormArray;
                control.push(from);
                this.onTouched();
                this.selectedTabIndex = this.objSampleTextCatalogService.getIdelTextTabList.length;
            } else {
                this.submitSTC = true;
            }
        } else {
            this.submitSTC = true;
        }
        this.checkIfAnyError.emit();
    }
    textPattern = `^\\S[a-zA-Z0-9_ ]*$`;
    initiateSTCFromForEdit(currentValue): UntypedFormGroup {
        return this.formBuilder.group({
            // idealText: [{value:currentValue.idealText,disabled:currentValue.enable}, Validators.required],
            idealText: [
                currentValue.idealText,
                Validators.compose([Validators.required, Validators.pattern(stcTextDesc)]),
            ],
            header: [currentValue.header],
            selected: [currentValue.selected],
            maxLength: [currentValue.maxLength],
            id: [currentValue.id],
            enable: [currentValue.enable],
            sameLengthFlag: [currentValue.sameLengthFlag],
            minlength: [currentValue.minlength],
            idealTextChanged: [currentValue.idealTextChanged],
            orignalIdealText: [currentValue.orignalIdealText],
            status: [currentValue.status],
            stc_id: [currentValue.stc_id],
        });
    }
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(_: UntypedFormControl) {
        return this.objSampleTextCatalogService.idealTextFG.valid ? null : { profile: { valid: false } };
    }
    isGreater(index) {
        return index >= 10;
    }
    removeStc() {
        this.ifSortFormExsit = false;

        if (this.selectedTabIndex > 0) {
            this.objSampleTextCatalogService.getIdelTextTabList.removeAt(this.selectedTabIndex);
            const filterData = [];
            this.objSampleTextCatalogService.getIdelTextTabList.value.map((text, index) => {
                if (index >= this.selectedTabIndex) {
                    text.header = 'Shortform' + index;
                    filterData.push(text);
                } else {
                    filterData.push(text);
                }
            });
            this.objSampleTextCatalogService.getIdelTextTabList.setValue(filterData);
            this.selectedTabIndex = this.objSampleTextCatalogService.getIdelTextTabList.length - 1;
            this.objSampleTextCatalogService.afterRemoveIdealTextAndDescSelectedChange(
                this.objSampleTextCatalogService.getIdelTextTabList.value
            );
            this.changeDetect.detectChanges();
        }
        const errorObj: any = {
            ifSortFormExsit: this.ifSortFormExsit,
            ifIdealTextChanged: this.ifIdealTextChanged,
            sameLengthShortForm: this.sameLengthShortForm,
        };
        this.eventBus.cast('stcSFError:idealTextError', errorObj);
    }
    tabHandleChange(e: MouseEvent) {
        e.stopPropagation();
    }
    checkIdealText(e, currentIndex) {
        const shortFormList = this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value?.filter(
            (x) => x.header != 'Ideal Text'
        );
        if (currentIndex > 0) {
            this.ifIdealTextChanged = false;
            if (e.target.value != '') {
                let listOfIdealTextSF = [];
                listOfIdealTextSF = shortFormList.map((item) => item.idealText);
                if (listOfIdealTextSF.length > 0) {
                    this.ifSortFormExsit =
                        listOfIdealTextSF.filter((item) => e.target.value.toLowerCase() === item.toLowerCase()).length >
                        1;
                    this.sameLengthShortForm =
                        listOfIdealTextSF.filter((item) => e.target.value.length === item.length).length > 1;
                    if (this.sameLengthShortForm) {
                        this.confirmSameLenthSortForm(currentIndex);
                    } else {
                        this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][currentIndex][
                            'controls'
                        ]['sameLengthFlag'].patchValue(false);
                    }
                }
            } else {
                this.ifSortFormExsit = false;
            }
            this.checkShortFormLength();
        } else {
            this.ifIdealTextChanged = false;
            const updatedMaxLength = e.target.value.length - 1;
            if (this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value.length > 0) {
                for (
                    let index = 0;
                    index < this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value.length;
                    index++
                ) {
                    if (index > 0) {
                        this.checkShortFormLength();
                        this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][index][
                            'controls'
                        ]['maxLength'].patchValue(updatedMaxLength);
                    } else {
                        this.checkShortFormLength();
                    }
                }
            }
            this.ifSortFormExsit = false;
            if (
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value[0]?.idealText !==
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow'].value[0]?.orignalIdealText
            ) {
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][0]['controls'][
                    'idealTextChanged'
                ].patchValue(1);
            } else {
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][0]['controls'][
                    'idealTextChanged'
                ].patchValue(0);
            }
        }
        const errorObj: any = {
            ifSortFormExsit: this.ifSortFormExsit,
            ifIdealTextChanged: this.ifIdealTextChanged,
            sameLengthShortForm: this.sameLengthShortForm,
        };
        this.eventBus.cast('stcSFError:idealTextError', errorObj);
    }
    onChangeTab(event) {
        this.selectedTabIndex = event.index;
        this.objSampleTextCatalogService.selectedIdealTextShortFromData =
            this.objSampleTextCatalogService.getIdelTextTabList?.value[event.index];
        this.objSampleTextCatalogService.itsDone =
            this.objSampleTextCatalogService.getIdelTextTabList?.value[event.index].status === 'Done' ? true : false;
    }
    confirmSameLenthSortForm(index) {
        this.confirmationService.confirm({
            message: `The text that you entered has the same length as the text of shortform 2!

        This is usually not recommended.
        
        Do you really want to create this shortform?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.sameLengthShortForm = false;
                const errorObj: any = {
                    ifSortFormExsit: this.ifSortFormExsit,
                    ifIdealTextChanged: this.ifIdealTextChanged,
                    sameLengthShortForm: this.sameLengthShortForm,
                };
                this.eventBus.cast('stcSFError:idealTextError', errorObj);
                this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][index]['controls'][
                    'sameLengthFlag'
                ].patchValue(false);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'You have accepted',
                });
            },
            reject: (type) => {
                switch (type) {
                    case ConfirmEventType.REJECT:
                        this.submitSTC = true;
                        this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][index][
                            'controls'
                        ]['sameLengthFlag'].patchValue(true);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        });
                        break;
                    case ConfirmEventType.CANCEL:
                        this.objSampleTextCatalogService.idealTextFG.controls['idealTextRow']['controls'][index][
                            'controls'
                        ]['sameLengthFlag'].patchValue(true);
                        this.submitSTC = true;
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Cancelled',
                            detail: 'You have cancelled',
                        });
                        break;
                }
            },
        });
    }
    checkShortFormLength() {
        const shortFormList = this.objSampleTextCatalogService.getIdelTextTabList?.value.filter(
            (item) => item.header != 'Ideal Text'
        );
        if (shortFormList != undefined) {
            if (shortFormList.length > 0) {
                const result = shortFormList.filter(
                    (item) =>
                        item.idealText.length >=
                        this.objSampleTextCatalogService.getIdelTextTabList.value[0].idealText.length
                );
                if (result.length > 0) {
                    this.submitSTC = true;
                    this.ifIdealTextChanged = true;
                } else {
                    this.ifIdealTextChanged = false;
                }
            }
        }
        const errorObj: any = {
            ifSortFormExsit: this.ifSortFormExsit,
            ifIdealTextChanged: this.ifIdealTextChanged,
            sameLengthShortForm: this.sameLengthShortForm,
        };
        this.eventBus.cast('stcSFError:idealTextError', errorObj);
    }
    resetValidation() {
        this.ifSortFormExsit = false;
        this.submitSTC = false;
        this.ifIdealTextChanged = false;
        this.sameLengthShortForm = false;
    }

    ngAfterViewInit() {
        this.subscription = this.idealTextAreaElement.changes.subscribe(() => {
            this.idealTextAreaElement?.last?.nativeElement.focus();
        });
    }
}
