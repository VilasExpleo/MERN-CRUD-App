/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription, catchError, of } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { StcActionService } from 'src/app/core/services/sample-text-catalog-service/stc-action.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { iconBaseUrl } from '../../../../shared/config/config';
import { StcHistoryRequestModel } from '../../stc-history/stc-history-request.model';
import { ProjectReferenceComponent } from './project-reference/project-reference.component';

@Component({
    selector: 'app-create-stc',
    templateUrl: './create-stc.component.html',
    styleUrls: ['./create-stc.component.scss'],
    providers: [MessageService],
})
export class CreateStcComponent implements OnInit, OnDestroy {
    BaseUrl: string = iconBaseUrl;
    projectName = 'Super HMI Group';
    nodeName = 'Hello Group';
    stcFormActionName = 'Create Sample Text';
    stcFormIcon = 'pi-plus';
    typeOption = []; //----store type
    genderOption = []; //----store gender
    NumerousOption = []; //----store Numerous
    desTextTab = []; //-----------Maintain description text ;
    submitSTC = false;
    stcFormGP: UntypedFormGroup;
    @Input() stcData;
    state;
    subscription: Subscription;
    langOption = [];
    items: MenuItem[] = [];
    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() setLayout: EventEmitter<any> = new EventEmitter();
    disabled = false;
    ifShortFormBlank = false;
    stcId: number;
    stcByMP = true;
    ifOtherBrand = true;
    ifSortFormExsit = false;
    ifIdealTextChanged = false;
    sameLengthShortForm = false;
    idealTextSubmit = true;
    ref: object;
    constructor(
        private fb: UntypedFormBuilder,
        private userService: UserService,
        private objSampleTextCatalogService: SampleTextCatalogService,
        private messageService: MessageService,
        private eventBus: NgEventBus,
        private objStcActionService: StcActionService,
        private actRoute: ActivatedRoute,
        private dialogService: DialogService
    ) {
        this.stcId = this.actRoute.snapshot.params['Id'];
        this.loadDropDowns();
        this.loadSTCForm();
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
    dataFromSTC(structureData: any): void {
        this.stcFormGP['controls']['idelTextTabList'].setValue({
            idealTextRow: [],
        });
        this.stcFormGP['controls']['descriptionTabList'].setValue({
            descriptionRow: [],
        });
        if (structureData != null) {
            this.ifOtherBrand = true;
            const stcData: any = structureData.data['structureSelectedRow'];
            this.objStcActionService.getSTCDataForEditView(structureData, this.stcFormGP).subscribe((res: any) => {
                this.eventBus.cast('ifStcPresent:langData', {
                    langOption: res?.updatedLangOption,
                });
                if (res.pageTitle === 'stcedit') {
                    this.stcFormActionName = 'Save';
                    this.stcFormIcon = 'pi-save';
                    this.enableDisable(false, 'edit');
                } else if (res.pageTitle === 'stcdetails') {
                    this.stcFormActionName = 'Details';
                    this.enableDisable(true, 'detail');
                    this.ifOtherBrand =
                        this.userService.getUser().brand_id === stcData?.parent?.data?.brand_id ||
                        this.userService.getUser().brand_id === stcData?.data?.brand_id
                            ? true
                            : false;
                } else {
                    this.stcFormActionName = 'Create Sample Text';
                    this.stcFormIcon = 'pi-plus';
                    this.enableDisable(false, 'create');
                }
                for (const key of Object.keys(this.stcFormGP.controls)) {
                    this.stcFormGP.controls[key].markAsTouched({ onlySelf: true });
                    // recalculate validity(status), by default emits `statusChanges`:
                    this.stcFormGP.controls[key].updateValueAndValidity({
                        onlySelf: true,
                    });
                }
            });
        }
        this.checkIfAnyError();
    }

    ngOnInit(): void {
        this.submitSTC = this.stcFormGP.invalid;
        this.stcFormGP.controls['brand'].disable();
        this.stcFormGP.controls['sampleTextId'].disable();
        this.stcFormGP.controls['projectName'].disable();
        this.subscription = this.eventBus.on('stc:edit').subscribe((data: MetaData) => {
            this.state = data.data;
            this.dataFromSTC(this.state);
            this.items =
                this.state?.data?.breadcrumbItems?.length > 0
                    ? this.state?.data?.breadcrumbItems
                    : [{ label: '[Root]' }];
            this.langOption = this.state?.data.targetLanguage;
            this.objStcActionService.getStateData();
        });
        this.eventBus.on('stc:create').subscribe((data: MetaData) => {
            this.state = data.data;
            this.dataFromSTC(this.state);
            this.items =
                this.state?.data?.breadcrumbItems?.length > 0
                    ? this.state?.data?.breadcrumbItems
                    : [{ label: '[Root]' }];
            this.langOption = this.state?.data.targetLanguage;
            this.objStcActionService.getStateData();
        });
        this.eventBus.on('stc:details').subscribe((data: MetaData) => {
            this.state = data.data;
            this.dataFromSTC(this.state);
            this.items =
                this.state?.data?.breadcrumbItems?.length > 0
                    ? this.state?.data?.breadcrumbItems
                    : [{ label: '[Root]' }];
            this.langOption = this.state?.data.targetLanguage;
            this.objStcActionService.getStateData();
        });
        if (this.stcId) {
            this.eventBus.cast('stcDataById:stcData', true);
            this.stcByMP = false;
            this.callStcTabelData(this.stcId);
        }
        this.eventBus.on('stcSFError:idealTextError').subscribe((data) => {
            this.ifIdealTextChanged = data['_data'].ifIdealTextChanged;
            this.ifSortFormExsit = data['_data'].ifSortFormExsit;
            this.sameLengthShortForm = data['_data'].sameLengthShortForm;
            this.checkIfAnyError();
        });
        this.eventBus.on('stcSFError:Desc').subscribe(() => {
            this.checkIfAnyError();
        });

        this.stcFormGP.valueChanges.subscribe(() => {
            this.idealTextSubmit = true;
        });
        this.eventBus.on('stc:stcIdByBreadcums').subscribe((data: MetaData) => {
            if (data?.data) this.items = data.data;
        });
        this.eventBus.on('stcSetting:showExternlProjectRef').subscribe(() => {
            this.externalProjectReference();
        });

        this.idealTextSubmit = false;
    }
    get stcFromControls() {
        return this.stcFormGP.controls;
    }
    loadSTCForm(): void {
        this.stcFormGP = this.fb.group({
            gender: new UntypedFormControl(),
            brand: [this.userService.getUser().brand_name],
            type: [
                {
                    type: 'DisplayText',
                    Id: 1,
                },
                [Validators.required],
            ],
            numerous: new UntypedFormControl(),
            sampleTextId: [],
            usedInProject: [''],
            idelTextTabList: new UntypedFormControl(),
            descriptionTabList: new UntypedFormControl(),
            brandId: [this.userService.getUser().brand_id],
            stcId: 0,
            language_id: 0,
            group_id: 0,
            sequence_order: 0,
            enable: false,
            parent_stc_id: 0,
            projectName: [''],
        });
        this.submitSTC = false;
    }
    stcSubmit(): void {
        if (
            (this.stcFormGP.invalid &&
                this.stcFormGP['value'].idelTextTabList['idealTextRow'][0].idealText.trim() === '') ||
            this.stcFormGP['value'].descriptionTabList['descriptionRow'][0].description.trim() === ''
        ) {
            this.submitSTC = true;
            this.idealTextSubmit = true;
        } else {
            if (!this.checkIfDescriptionIsBlank()) {
                if (!this.checkShortFormBlank()) {
                    this.ifShortFormBlank = false;
                    if (!this.checkDuplicateSTC() && !this.checkSameLengthSTC()) {
                        if (!this.checkShortFormLength()) {
                            this.idealTextSubmit = false;
                            this.insertUpdateSTC();
                        } else {
                            this.submitSTC = true;
                            this.idealTextSubmit = true;
                        }
                    }
                } else {
                    this.submitSTC = true;
                    this.ifShortFormBlank = true;
                    this.idealTextSubmit = true;
                }
            } else {
                this.submitSTC = true;
                this.idealTextSubmit = true;
            }
        }
    }
    insertUpdateSTC() {
        this.submitSTC = false;
        if (this.stcFormGP.value.stcId === 0 || this.stcFormActionName === 'Create Sample Text') {
            this.objStcActionService
                .getCreateSTCInsertData(this.stcFormGP.value, this.stcFormActionName)
                .subscribe((payload) => {
                    this.objSampleTextCatalogService
                        .saveSTCDataRequest('stc-master/create-Stc', payload)
                        .subscribe((response) => {
                            if (response) {
                                if (response['status'] === 'OK') {
                                    this.stcFormGP.controls['sampleTextId'].setValue(response['parent_stc_id']);
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Success',
                                        detail: response['message'],
                                    });
                                    this.state.data.isGroupAction = 1;
                                    this.eventBus.cast('structure:create', 'stc');
                                    this.objSampleTextCatalogService.setSTCState(this.state.data);
                                    setTimeout(() => {
                                        const data = {
                                            title: 'Details Of Sample Text',
                                            contentId: 'stc',
                                        };
                                        this.setLayout.emit(data);
                                        this.enableDisable(true, 'detail');
                                        /// this.cancelForm();
                                    }, 1000);
                                    this.eventBus.cast('stc:history', this.getStcHistory());
                                } else if (response['status'] === 'NOK') {
                                    this.messageService.add({
                                        severity: 'warn',
                                        summary: 'Warning',
                                        detail: response['message'],
                                    });
                                }
                            }
                        });
                });
        } else {
            this.objStcActionService
                .getCreateSTCInsertData(this.stcFormGP.value, this.stcFormActionName)
                .subscribe((payload) => {
                    if (payload) {
                        this.objStcActionService
                            .updateStcDataRequest('stc-master/update-Stc', payload.updateSTCData)
                            .subscribe((response) => {
                                if (response) {
                                    this.eventBus.cast('stc:history', this.getStcHistory());
                                    this.objStcActionService
                                        .updateStcDataRequest('stc-master/update-shortform', payload.shortFormData)
                                        .subscribe((responseUS) => {
                                            if (responseUS) {
                                                this.eventBus.cast('stc:history', this.getStcHistory());
                                                this.objStcActionService
                                                    .updateStcDataRequest(
                                                        'stc-master/update-description',
                                                        payload.descriptionData
                                                    )
                                                    .subscribe((responseUD) => {
                                                        if (responseUD) {
                                                            if (response['status'] === 'OK') {
                                                                this.eventBus.cast('stc:history', this.getStcHistory());
                                                                this.messageService.add({
                                                                    severity: 'success',
                                                                    summary: 'Success',
                                                                    detail: response['message'],
                                                                });
                                                                this.state.data.isGroupAction = 1;
                                                                this.eventBus.cast('structure:create', 'stc');
                                                                this.objSampleTextCatalogService.setSTCState(
                                                                    this.state.data
                                                                );
                                                                setTimeout(() => {
                                                                    const data = {
                                                                        title: 'Details Of Sample Text',
                                                                        contentId: 'stc',
                                                                    };
                                                                    this.setLayout.emit(data);
                                                                    this.enableDisable(true, 'detail');
                                                                }, 1000);
                                                            } else if (response['status'] === 'NOK') {
                                                                this.messageService.add({
                                                                    severity: 'warn',
                                                                    summary: 'Warning',
                                                                    detail: response['message'],
                                                                });
                                                            }
                                                            if (payload.descDeletedId.description_list.length > 0) {
                                                                this.objStcActionService
                                                                    .deleteSTCShortForm(
                                                                        'deletestc/delete_description',
                                                                        payload.descDeletedId
                                                                    )
                                                                    .subscribe((deleteDesRes) => {
                                                                        if (deleteDesRes) {
                                                                            if (deleteDesRes['status'] === 'Ok') {
                                                                                this.state.data.isGroupAction = 1;
                                                                                this.objSampleTextCatalogService.setSTCState(
                                                                                    this.state.data
                                                                                );
                                                                                this.eventBus.cast(
                                                                                    'stc:history',
                                                                                    this.getStcHistory()
                                                                                );
                                                                            }
                                                                        }
                                                                    });
                                                            }
                                                            if (payload.shortFromDeletedId.short_forms_id.length > 0) {
                                                                this.objStcActionService
                                                                    .deleteSTCShortForm(
                                                                        'deletestc/delete_short_form',
                                                                        payload.shortFromDeletedId
                                                                    )
                                                                    .subscribe((deleteITRes) => {
                                                                        if (deleteITRes) {
                                                                            this.state.datseta.isGroupAction = 1;
                                                                            this.objSampleTextCatalogService.setSTCState(
                                                                                this.state.data
                                                                            );
                                                                            this.eventBus.cast(
                                                                                'stc:history',
                                                                                this.getStcHistory()
                                                                            );
                                                                        }
                                                                    });
                                                            }
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                    }
                });
        }
    }

    loadDropDowns(): void {
        this.typeOption.push(
            {
                type: 'DisplayText',
                Id: 1,
            },
            {
                type: 'SdsCommand',
                Id: 2,
            },
            {
                type: 'SdsPrompt',
                Id: 3,
            }
        );
        this.genderOption.push(
            {
                gender: 'Male',
                Id: 1,
            },
            {
                gender: 'Female',
                Id: 2,
            }
        );
        this.NumerousOption.push(
            {
                numerous: 'Singular',
                Id: 1,
            },
            {
                numerous: 'Plural',
                Id: 2,
            }
        );
    }
    cancelForm() {
        this.reset();
        this.cancel.emit();
    }
    reset() {
        this.stcFormGP.controls['descriptionTabList'].patchValue({
            descriptionRow: [],
        });
        this.stcFormGP.controls['idelTextTabList'].patchValue({ idealTextRow: [] });
        this.stcFormGP.reset();
    }
    detailsSTC() {
        const data = {
            title: 'Details Of Sample Text',
            data: this.state,
            contentId: 'stc',
        };
        this.state.title = 'stcdetails';
        this.setLayout.emit(data);
    }
    editForm(obj) {
        this.enableDisable(obj.flag, obj.source);
        const data = {
            title: 'Edit Sample Text',
            contentId: 'stc',
        };
        this.setLayout.emit(data);
    }
    enableDisable(flag, source) {
        this.disabled = flag;
        if (flag) {
            this.stcFormGP.controls['gender'].disable();
            this.stcFormGP.controls['numerous'].disable();
            this.stcFormGP.controls['type'].disable();
            this.enableDisableIdealTextAndDesc(true);
            if (source === 'detail') {
                this.stcFormActionName = 'Details';
            }
        } else {
            if (source === 'update') {
                this.stcFormActionName = 'Save';
            }
            this.stcFormGP.controls['gender'].enable();
            this.stcFormGP.controls['numerous'].enable();
            this.stcFormGP.controls['type'].enable();
            this.enableDisableIdealTextAndDesc(false);
        }
    }
    checkIfDescriptionIsBlank() {
        let ifExsit = false;
        if (this.stcFormGP.value.descriptionTabList != null) {
            if (this.stcFormGP?.value['descriptionTabList']['descriptionRow'] != undefined) {
                ifExsit = this.stcFormGP?.value['descriptionTabList']['descriptionRow']?.some(
                    (x) => x.description.trim() === ''
                );
            } else if (this.stcFormGP?.value['descriptionTabList'].length > 0) {
                if (this.stcFormGP?.value['descriptionTabList'][0].description === '') {
                    ifExsit = true;
                }
            }
        }
        return ifExsit;
    }

    checkDuplicateSTC() {
        if (this.stcFormGP['value']?.idelTextTabList === null) {
            return true;
        } else {
            if (this.stcFormGP['value']?.idelTextTabList['idealTextRow']?.length > 0) {
                const shortFormList = this.stcFormGP['value']?.idelTextTabList['idealTextRow']
                    .filter((item) => item.header != 'Ideal Text')
                    .map((item) => item.idealText.toLowerCase());
                const toFindSFDuplicats = (list) => list.filter((item, index) => list.indexOf(item) !== index);
                const duplicateElementea = toFindSFDuplicats(shortFormList);
                return duplicateElementea.length > 0;
            } else {
                return false;
            }
        }
    }
    checkSameLengthSTC() {
        if (this.stcFormGP['value']?.idelTextTabList === null) {
            return true;
        } else {
            if (this.stcFormGP['value']?.idelTextTabList['idealTextRow']?.length > 0) {
                const ifConfirmIfNo = this.stcFormGP['value']?.idelTextTabList['idealTextRow']
                    .map((item) => item?.sameLengthFlag != null && item?.sameLengthFlag)
                    .filter((item) => item === true).length;
                if (ifConfirmIfNo) {
                    return ifConfirmIfNo > 0;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
    checkShortFormLength() {
        const shortFormList = this.stcFormGP['value']?.idelTextTabList['idealTextRow'].filter(
            (item) => item.header != 'Ideal Text'
        );
        if (shortFormList != undefined) {
            if (shortFormList.length > 0) {
                const result = shortFormList.filter(
                    (item) =>
                        item.idealText.length >=
                        this.stcFormGP['value']?.idelTextTabList['idealTextRow'][0].idealText.length
                );
                return result.length > 0;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    checkShortFormBlank() {
        const shortFormList = this.stcFormGP['value']?.idelTextTabList['idealTextRow'].filter(
            (item) => item.header != 'Ideal Text'
        );
        if (shortFormList != undefined) {
            if (shortFormList.length > 0) {
                const result = shortFormList.filter((item) => item.idealText.trim() === '');
                return result.length > 0;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    callStcTabelData(stcId) {
        const postObj: any = {
            start_row: 0,
            end_row: 100,
            editor_id: this.userService.getUser().id,
            stc_id: stcId,
        };
        if (postObj) {
            this.objSampleTextCatalogService
                .STCTable('stc-table', postObj)
                .pipe(catchError(() => of(undefined)))
                .subscribe({
                    next: (res) => {
                        if (res?.['status'] === 'OK') {
                            this.eventBus.cast('stcIdByTableData:stcTable', res['data']);
                            this.getStructureDataAfterStcDataByStcID(res['data']);
                        }
                    },
                });
        }
    }
    getStructureDataAfterStcDataByStcID(filterData) {
        const url = `stc-table/filter-data`;
        this.objSampleTextCatalogService
            .getStructureDataFromDB(url, {
                stc_data: filterData,
                editor_id: this.userService.getUser().id,
            })
            .subscribe((res) => {
                if (res['status'] == 'OK') {
                    if (res['data'].length != 0) {
                        const result = this.objSampleTextCatalogService.getStcData(this.stcId, res['data']);
                        this.objSampleTextCatalogService.structuredData = result;
                        if (result) {
                            this.eventBus.cast('structure:byStcId', '');
                            const data = {
                                title: 'Details Of Sample Text',
                                data: { structureSelectedRow: result[result.length - 1] },
                                contentId: 'stc',
                            };
                            this.dataFromSTC(data);
                        }
                        this.eventBus.cast('structure:byStc', res['data']);
                    }
                }
            });
    }
    checkIfAnyError() {
        this.idealTextSubmit =
            this.ifSortFormExsit ||
            this.sameLengthShortForm ||
            this.ifIdealTextChanged ||
            this.stcFormGP.invalid ||
            this.checkIfDescriptionIsBlank() ||
            this.checkSameLengthSTC() ||
            this.checkDuplicateSTC() ||
            this.checkShortFormBlank() ||
            this.checkShortFormLength();
    }
    enableDisableIdealTextAndDesc(flag) {
        const enableIdealText = [];
        const enableDescription = [];
        this.stcFormGP['controls']['idelTextTabList'].value.idealTextRow.map((item) => {
            item.enable = flag;
            enableIdealText.push(item);
        });
        this.stcFormGP['controls']['descriptionTabList'].value.descriptionRow.map((item) => {
            item.enable = flag;
            enableDescription.push(item);
        });
        setTimeout(() => {
            this.stcFormGP['controls']['idelTextTabList'].setValue({
                idealTextRow: [],
            });
            setTimeout(() => {
                this.stcFormGP['controls']['idelTextTabList'].setValue({
                    idealTextRow: enableIdealText,
                });
            }, 0);
        }, 0);
        setTimeout(() => {
            this.stcFormGP['controls']['descriptionTabList'].setValue({
                descriptionRow: [],
            });
            setTimeout(() => {
                this.stcFormGP['controls']['descriptionTabList'].setValue({
                    descriptionRow: enableDescription,
                });
            }, 0);
        }, 0);
    }
    showExternalProjectReferences(data) {
        this.ref = this.dialogService.open(ProjectReferenceComponent, {
            header: 'External Project References',
            width: '50%',
            contentStyle: { 'max-height': '500px', overflow: 'auto' },
            baseZIndex: 10000,
            data: data,
        });
    }
    externalProjectReference() {
        const postObj: any = {
            stc_id: this.stcFormGP?.controls['sampleTextId']?.value,
        };
        this.objSampleTextCatalogService
            .externalProjectReference('stc-group/stc-external-reference', postObj)
            .subscribe((res: any) => {
                if (res['status'] == 'OK') {
                    if (res['data'] !== null) {
                        const ProjectReferences = [];
                        res['data'].map((item) => {
                            const obj: any = {
                                title: item.title,
                                version_no: item.version_no.toString().split('.')[1],
                                textnode_id: item.textnode_id,
                                name: item.name,
                                variant_id: item.variant_id,
                            };
                            ProjectReferences.push(obj);
                        });
                        this.showExternalProjectReferences(ProjectReferences);
                    }
                }
            });
    }
    onChangeGender() {
        this.checkIfAnyError();
    }
    onChangeNumerous() {
        this.checkIfAnyError();
    }
    onChangeType() {
        this.checkIfAnyError();
    }

    getStcHistory(): StcHistoryRequestModel {
        return {
            language_code: this.langOption?.find((lang) => lang.language_id === this.stcFormGP.value.language_id)
                ?.language_culture_name,
            stc_id: this.stcFormGP.controls['sampleTextId'].value,
            super_stc_id: this.stcFormGP.controls['parent_stc_id'].value,
        };
    }
}
