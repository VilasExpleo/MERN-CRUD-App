import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormArray,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { NgEventBus } from 'ng-event-bus';
import { Subscription } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { iconBaseUrl } from '../../../../../shared/config/config';
import { IdescriptionTabList } from './descriptionTabList';
import { stcTextDesc } from 'src/app/shared/models/patterns';

@Component({
    selector: 'app-description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DescriptionComponent,
            multi: true,
        },

        {
            provide: NG_VALIDATORS,
            useExisting: DescriptionComponent,
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {
    BaseUrl: string = iconBaseUrl;
    sub: Subscription[] = [];
    langOption: [];
    userInfo;
    dataObject = {};
    descriptionFG: UntypedFormGroup;
    @Input() submitSTC = false;
    state;
    selectedTabIndex = 0;
    @ViewChild('desc') desc: ElementRef;
    subscription: any;
    @ViewChildren('descriptionAreaElement', { read: ElementRef }) descriptionAreaElement: QueryList<ElementRef>;
    constructor(
        private formBuilder: UntypedFormBuilder,
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private ref: ChangeDetectorRef,
        private eventBus: NgEventBus
    ) {
        this.descriptionFG = this.formBuilder.group({
            descriptionRow: this.formBuilder.array([]),
        });
        this.sub.push(
            this.descriptionFG.valueChanges.subscribe((value) => {
                this.onChange(value);
            })
        );
    }

    get getDescriptionTabList() {
        return this.descriptionFG.get('descriptionRow') as UntypedFormArray;
    }
    ngOnInit(): void {
        this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.state = res;
            this.langOption = res.targetLanguage;
        });
        this.eventBus.on('ifStcPresent:langData').subscribe((langData: any) => {
            if (langData._data.langOption.length > 0) {
                this.langOption = langData._data.langOption;
            }
        });
        this.onPageLoad();
    }
    onPageLoad() {
        this.userInfo = this.userService.getUser();
        this.dataObject['user'] = this.userInfo;
        this.sampleTextCatalogService.setSTCState(this.dataObject);
        this.addDescTextTab({
            description: '',
            header: 'de-DE',
            selected: false,
            id: 0,
            oldNew: 1,
            enable: false,
        });
    }

    //----------------------Control value accessor---------------------
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: (value: IdescriptionTabList[]) => void = () => {};
    onTouched: () => void;
    get value(): IdescriptionTabList[] {
        return this.descriptionFG.value;
    }
    set value(value: IdescriptionTabList[]) {
        value['descriptionRow'].map((deccRow, index) => {
            this.getDescriptionTabList.push(this.initiateDescFromForEdit(deccRow));
            if (deccRow.enable) {
                this.getDescriptionTabList['controls'][index]['controls']['description'].disable();
            } else {
                this.getDescriptionTabList['controls'][index]['controls']['description'].enable();
            }
        });

        this.onChange(value);
        this.onTouched();
        this.ref.detectChanges();
    }
    writeValue(obj: any) {
        if (obj != null) {
            if (obj['descriptionRow'].length > 0) {
                if (this.getDescriptionTabList.value.length > 0) {
                    if (this.getDescriptionTabList.value[0].header === null) {
                        this.getDescriptionTabList.removeAt(0);
                    }
                }
                this.value = obj;
            } else {
                if (this.getDescriptionTabList.value.length > 0) {
                    this.getDescriptionTabList.value.map(() => {
                        this.getDescriptionTabList.removeAt(0);
                    });
                }
            }
        }
    }
    registerOnTouched(obj) {
        this.onTouched = obj;
    }
    registerOnChange(obj) {
        this.onChange = obj;
    }
    ngOnDestroy() {
        this.sub.forEach((s) => s.unsubscribe());
        this.subscription && this.subscription.unsubscribe();
    }

    setDisabledState(angularPrProvidedDisabledVal) {
        if (angularPrProvidedDisabledVal) {
            this.descriptionFG.disable();
        } else {
            this.descriptionFG.enable();
        }
    }
    //-------------------------------------------------------------------------------

    addDescTextTab(selectedLang: any) {
        if (this.descriptionFG.valid) {
            const ifExsist = this.descriptionFG.value.descriptionRow.find(
                (item) => item.header === selectedLang.language_culture_name
            );
            if (!ifExsist) {
                const objSelectedlang: any = {
                    description: selectedLang.description === undefined ? '' : selectedLang.description,
                    header: selectedLang.language_culture_name,
                    selected: false,
                    id: selectedLang.language_id,
                    oldNew: 1,
                    enable: false,
                };
                this.getDescriptionTabList.push(
                    this.initiateDescFromForEdit(objSelectedlang, this.descriptionFG.value.descriptionRow.length)
                );
            }
        }
    }
    onChangeLang(event) {
        this.addDescTextTab(event.value);
        const list: FormArray = this.getDescriptionTabList;
        list.controls.forEach((formGroup) => {
            formGroup.patchValue({ selected: false });
        });
        const descriptionTabListGroup = list.at(list.length - 1);
        descriptionTabListGroup.patchValue({ selected: true });
        this.selectedTabIndex = list.length - 1;
    }
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(_: UntypedFormControl) {
        return this.descriptionFG.valid ? null : { profile: { valid: false } };
    }

    initiateDescFromForEdit(currentValue, length?: number): UntypedFormGroup {
        return new UntypedFormGroup({
            description: new UntypedFormControl(
                currentValue.description,
                Validators.compose([
                    length >= 1 ? Validators.pattern(stcTextDesc) : Validators.required,
                    Validators.pattern(stcTextDesc),
                ])
            ),
            header: new UntypedFormControl(currentValue.header),
            selected: new UntypedFormControl(currentValue.selected),
            id: new UntypedFormControl(currentValue.id),
            oldNew: new UntypedFormControl(currentValue.oldNew),
            enable: new UntypedFormControl(currentValue.enable),
        });
    }
    removeDesc() {
        if (this.selectedTabIndex > 0) {
            this.getDescriptionTabList.removeAt(this.selectedTabIndex);
            this.selectedTabIndex = this.getDescriptionTabList.value.length - 1;
            this.sampleTextCatalogService.afterRemoveIdealTextAndDescSelectedChange(this.getDescriptionTabList.value);
            this.eventBus.cast('stcSFError:Desc');
            this.ref.detectChanges();
        }
    }
    onChangeTab(event) {
        this.selectedTabIndex = event.index;
    }
    checkDescText() {
        this.eventBus.cast('stcSFError:Desc', '');
    }
    ngAfterViewInit() {
        this.subscription = this.descriptionAreaElement.changes.subscribe(() => {
            this.descriptionAreaElement?.last?.nativeElement.focus();
        });
    }
}
