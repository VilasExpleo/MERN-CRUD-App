import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../api.service';
import { SampleTextCatalogService } from './sample-text-catalog.service';
@Injectable({
    providedIn: 'root',
})
export class StcActionService {
    public stateData: any;
    constructor(private api: ApiService, private objSampleTextCatalogService: SampleTextCatalogService) {
        this.getStateData();
    }

    //--------------------------STC Crud------------------------
    getStateData() {
        this.objSampleTextCatalogService.getSTCState().subscribe((res) => {
            this.stateData = res;
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCreateSTCInsertData(STCFromData: any, action: any): Observable<any> {
        let insertSTCData: any;
        const ideal_text_ListData =
            STCFromData?.idelTextTabList?.idealTextRow === undefined
                ? STCFromData?.idelTextTabList
                : STCFromData?.idelTextTabList?.idealTextRow;
        const descDataList =
            STCFromData?.descriptionTabList?.descriptionRow === undefined
                ? STCFromData?.descriptionTabList
                : STCFromData?.descriptionTabList?.descriptionRow;
        const stcType = STCFromData.type ? STCFromData.type.Id : 0;
        const stcGender = STCFromData.gender ? STCFromData.gender.Id : 0;
        const stcNumerous = STCFromData.numerous ? STCFromData.numerous.Id : 0;

        if (STCFromData.stcId === 0) {
            insertSTCData = {
                parent_stc_id: STCFromData.parent_stc_id,
                brand_id: STCFromData.brandId,
                editor_id:
                    this.stateData?.user?.id === undefined ? this.stateData?.data?.user.id : this.stateData?.user.id,
                language_id: STCFromData.language_id,
                group_id: STCFromData.group_id,
                ideal_text: ideal_text_ListData[0].idealText,
                sequence_order: STCFromData.sequence_order,
                short_forms: this.getIdealText(ideal_text_ListData),
                descriptions: this.getDescriptionData(STCFromData.descriptionTabList.descriptionRow),
                type: stcType,
                gender: stcGender,
                numerous: stcNumerous,
            };
        } else {
            const userData = this.stateData.user === undefined ? this.stateData?.data?.user : this.stateData.user;
            const updateSTCData = {
                parent_stc_id: STCFromData.parent_stc_id,
                stc_id: STCFromData.stcId,
                brand_id: STCFromData.brandId,
                editor_id: userData.id,
                language_id: STCFromData.language_id,
                group_id: STCFromData.group_id,
                ideal_text: ideal_text_ListData[0].idealText,
                sequence_order: 1,
                type: stcType,
                gender: stcGender,
                numerous: stcNumerous,
                flag: ideal_text_ListData[0].idealTextChanged,
            };
            const shortFormData: any = {
                stc_id: STCFromData.stcId,
                editor_id: userData.id,
                existing_short_form: this.getIdealTextObjList(ideal_text_ListData).existing_short_form,
                new_short_form: this.getIdealTextObjList(ideal_text_ListData).new_short_form,
            };
            const descriptionData: any = {
                stc_id: STCFromData.stcId,
                editor_id: userData.id,
                existing_description: this.getDescriptionObjList(descDataList).existing_description,
                new_description: this.getDescriptionObjList(descDataList).new_description,
            };
            const deleteDescriptionList = this.getDescriptionObjList(descDataList).delete_description;

            const detetdIdealText = this.getIdealTextObjList(ideal_text_ListData).short_forms_id;

            insertSTCData = {
                updateSTCData: updateSTCData,
                shortFormData: shortFormData,
                descriptionData: descriptionData,
                shortFromDeletedId: {
                    short_forms_id: detetdIdealText,
                    stc_id: STCFromData.stcId,
                    editor_id: userData.id,
                },
                descDeletedId: {
                    description_list: deleteDescriptionList,
                    stc_id: STCFromData.stcId,
                    editor_id: userData.id,
                },
            };
        }

        return of(insertSTCData);
    }
    getIdealText(idealTextList: any[]) {
        return idealTextList?.filter((x) => x.header != 'Ideal Text').map((x) => x.idealText);
    }
    getIdealTextObjList(idealTextList: any[]) {
        const existing_short_form: any = [];
        const new_short_form: any = [];
        idealTextList
            ?.filter((x) => x.header != 'Ideal Text' && x.id !== 0)
            .forEach((x) => {
                existing_short_form.push({ short_form: x.idealText, short_form_id: x.id });
            });
        idealTextList
            ?.filter((x) => x.header != 'Ideal Text' && x.id === 0)
            .forEach((x) => {
                new_short_form.push({ short_form: x.idealText });
            });
        const afterDeletedSHId = idealTextList?.filter((item) => item.id > 0).map((item) => item.id);
        const oldShortFromIdList = this.stateData?.structureSelectedRow.children.map((x) => x.data.id);
        const deletedId =
            afterDeletedSHId.length > 0
                ? oldShortFromIdList.filter((el) => {
                      return afterDeletedSHId.indexOf(el) === -1;
                  })
                : oldShortFromIdList;
        return { existing_short_form: existing_short_form, new_short_form: new_short_form, short_forms_id: deletedId };
    }
    getDescriptionData(descriptionList: any[]) {
        const res: any = [];
        descriptionList?.map((item) => {
            const obj: any = {
                langauge_id: item.id,
                description: item.description,
            };
            res.push(obj);
        });

        return res;
    }
    deleteSTCSampleText(url, data) {
        return this.api.deleteTypeRequest(url, data);
    }
    deleteSTCShortForm(url, data) {
        return this.api.deleteTypeRequest(url, data);
    }
    getDescriptionObjList(descList: any[]) {
        const existing_description: any = [];
        const new_description: any = [];
        descList
            ?.filter((m) => m.oldNew === 0)
            .forEach((x) => {
                const findLangId = this.stateData?.structureSelectedRow.data.description.find(
                    (item) => item.id === x.id
                );
                if (findLangId) {
                    existing_description.push({
                        description: x.description,
                        description_id: x.id,
                        langauge_id: findLangId.langauge_id,
                    });
                }
            });
        descList
            ?.filter((m) => m.oldNew === 1)
            .forEach((x) => {
                new_description.push({ description: x.description, langauge_id: x.id });
            });
        const afterDeletedDesId = descList?.filter((x) => x.oldNew === 0).map((x) => x.id);
        const oldDesciptionIdList = this.stateData?.structureSelectedRow.data.description.map((x) => x.id);
        const deletedId =
            afterDeletedDesId?.length > 0
                ? oldDesciptionIdList?.filter((el) => {
                      return afterDeletedDesId?.indexOf(el) === -1;
                  })
                : oldDesciptionIdList;
        const deletedIDWithLangIds = [];
        if (deletedId.length > 0) {
            deletedId.forEach((element) => {
                const findLangId = this.stateData?.structureSelectedRow.data.description.find(
                    (item) => item.id === element
                );
                if (findLangId) {
                    deletedIDWithLangIds.push({ id: element, language_id: findLangId.langauge_id });
                }
            });
        }
        return {
            existing_description: existing_description,
            new_description: new_description,
            delete_description: deletedIDWithLangIds,
        };
    }
    updateStcDataRequest(url, data) {
        return this.api.patchTypeRequest(url, data);
    }
    getIdealTextData(element, ideal_text, index, pageTitle, stc_id) {
        return {
            idealText: element.stc_text,
            header: 'Shortform ' + (index + 1),
            selected: false,
            maxLength: ideal_text.length - 1,
            id: element.id,
            enable: pageTitle === 'stcdetails' ? true : false,
            sameLengthFlag: element.sameLengthFlag,
            minlength: 0,
            idealTextChanged: 0,
            orignalIdealText: element.stc_text,
            status: element?.status,
            stc_id: stc_id,
        };
    }
    getLanguageId(stcData, langOption) {
        if (stcData?.data?.language_id === null || stcData?.data?.language_id === undefined) {
            if (stcData?.data['language_id'] === undefined) {
                return langOption[0].language_id;
            } else {
                return stcData?.data['language_id'];
            }
        } else {
            return stcData?.data?.language_id;
        }
    }
    getSTCDataForEditView(stcDataFromDB: any, stcFromGroup: any): Observable<any> {
        let updatedLangOption: any[] = [];
        this.getStateData();
        const langOption = this.stateData?.targetLanguage;
        let pageTitle: string;
        if (stcDataFromDB.title != undefined) {
            switch (stcDataFromDB.title) {
                case 'Create Sample Text':
                    pageTitle = 'stccreate';
                    break;
                case 'Edit Sample Text':
                    pageTitle = 'stcedit';
                    break;
                default:
                    pageTitle = 'stcdetails';
                    break;
            }
            if (pageTitle != undefined) {
                let stcData: any = {};
                if (stcDataFromDB.data['structureSelectedRow'].data.Type === 'Ideal-text') {
                    const stcDataTemp = stcDataFromDB?.data['structureSelectedRow']?.children.find(
                        (item) => item?.data?.stc_text === stcDataFromDB.data['structureSelectedRow']?.data?.context
                    );
                    if (stcDataTemp) {
                        stcData = stcDataTemp;
                    }
                } else {
                    stcData = stcDataFromDB.data['structureSelectedRow'];
                }

                if (stcData != undefined) {
                    let group_id: string;
                    let sequence_order: string;
                    if (stcData['data']['Type'] === 'Stc' && stcData['data']['language_id']) {
                        group_id = stcData.data['group_id:']
                            ? stcData.data['group_id:']
                            : stcData?.parent?.parent?.data.Id;
                    } else {
                        switch (stcData['data']['Type']) {
                            case 'Stc':
                                group_id = stcData['data']['group_id:'];
                                break;
                            case 'Group':
                                if (stcData['data']['Id'] === undefined) {
                                    group_id = stcData['data']['group_id:'];
                                } else {
                                    group_id = stcData['data']['Id'];
                                }
                                break;
                            default:
                                group_id = stcData?.parent?.parent?.data.Id;
                                break;
                        }
                    }
                    // eslint-disable-next-line prefer-const
                    sequence_order =
                        stcData['data']['sequence_order'] === undefined
                            ? stcData?.parent?.parent?.data?.sequence_order
                            : stcData['data']['sequence_order'];
                    const langauge_id: string = this.getLanguageId(stcData, langOption);
                    let userdata: any = {};
                    if (this.stateData?.user) {
                        userdata = this.stateData?.user;
                    } else if (this.stateData?.data?.user) {
                        userdata = this.stateData?.data?.user;
                    } else {
                        userdata = this.stateData?.data?.data.user;
                    }
                    stcFromGroup['controls']['enable'].patchValue(false);
                    stcFromGroup['controls']['language_id'].patchValue(langauge_id);
                    stcFromGroup['controls']['group_id'].patchValue(group_id);
                    stcFromGroup['controls']['sequence_order'].patchValue(sequence_order);

                    stcFromGroup['controls']['stcId'].patchValue(
                        stcData.data.stc_id == undefined ? 0 : stcData.data.stc_id
                    );

                    stcFromGroup['controls']['sampleTextId'].patchValue(
                        stcData.data.stc_id == undefined ? 0 : stcData.data.stc_id
                    );
                    stcFromGroup['controls']['parent_stc_id'].patchValue(
                        stcData.data.stc_id === undefined ? 0 : stcData.data.stc_id
                    );
                    stcFromGroup['controls']['usedInProject'].patchValue(
                        stcData.data.used_project_count === undefined ? 0 : stcData.data.used_project_count
                    );
                    stcFromGroup['controls']['projectName'].patchValue(
                        stcData.data.project === undefined ? '' : stcData.data.project
                    );
                    const ideal_text = stcData.data.stc_text;
                    const idelTextShortFrom = [];
                    const descriptionList = [];
                    if (
                        pageTitle === 'stcedit' ||
                        pageTitle === 'stcdetails' ||
                        pageTitle === '"Details of Sample text"'
                    ) {
                        stcFromGroup['controls']['brand'].patchValue(stcData?.data?.brand_name);
                        stcFromGroup['controls']['brandId'].patchValue(stcData?.data?.brand_id);
                        stcFromGroup['controls']['parent_stc_id'].patchValue(stcData.data.parent_stc_id);
                        const shortFormMaxLength = stcData.children.map((item) => item?.data?.stc_text.length);
                        idelTextShortFrom.push({
                            idealText: ideal_text ? ideal_text : '',
                            header: 'Ideal Text',
                            selected: true,
                            id: stcData.data.stc_id,
                            enable: pageTitle === 'stcdetails' ? true : false,
                            sameLengthFlag: false,
                            minlength: Math.max(...shortFormMaxLength),
                            idealTextChanged: 0,
                            orignalIdealText: ideal_text ? ideal_text : '',
                            status: stcData?.data?.status,
                            stc_id: stcData?.data?.stc_id,
                        });

                        if (stcData.children) {
                            for (let index = 0; index < stcData.children.length; index++) {
                                const element = stcData.children[index].data;
                                idelTextShortFrom.push(
                                    this.getIdealTextData(element, ideal_text, index, pageTitle, stcData?.data?.stc_id)
                                );
                            }
                            for (let index = 0; index < stcData?.data?.description?.length; index++) {
                                const element = stcData.data.description[index];
                                descriptionList.push({
                                    description: element.description,
                                    header: element.language_code,
                                    selected: index === 0 ? true : false,
                                    id: element.id,
                                    oldNew: 0,
                                    enable: pageTitle === 'stcdetails' ? true : false,
                                });
                            }
                        } else {
                            stcFromGroup['controls']['type'].patchValue({
                                type: 'DisplayText',
                                Id: 1,
                            });

                            descriptionList.push({
                                description: '',
                                header: stcData.data.context
                                    ? stcData.data.context
                                    : langOption[0].language_culture_name,
                                selected: true,
                                id: stcData?.data?.context ? stcData?.data?.language_id : langOption[0]?.language_id,
                                oldNew: 0,
                                enable: pageTitle === 'stcdetails' ? true : false,
                            });
                        }

                        stcFromGroup['controls']['gender'].patchValue({
                            gender: stcData.data.gender,
                            Id: stcData.data.gender_id,
                        });
                        stcFromGroup['controls']['type'].patchValue({
                            type: stcData.data.type,
                            Id: stcData.data.type_id,
                        });
                        stcFromGroup['controls']['numerous'].patchValue({
                            numerous: stcData.data.numerous,
                            Id: stcData.data.numerous_id,
                        });

                        stcFromGroup
                            .get('idelTextTabList')
                            .patchValue({ idealTextRow: idelTextShortFrom }, { emitEvent: false });
                        stcFromGroup
                            .get('descriptionTabList')
                            .patchValue({ descriptionRow: descriptionList }, { emitEvent: false });
                    } else if (pageTitle === 'stccreate') {
                        stcFromGroup['controls']['brand'].patchValue(userdata.brand_name);
                        stcFromGroup['controls']['brandId'].patchValue(userdata.brand_id);
                        stcFromGroup['controls']['sampleTextId'].patchValue(0);
                        stcFromGroup['controls']['stcId'].patchValue(0);
                        stcFromGroup['controls']['gender'].patchValue('');
                        stcFromGroup['controls']['numerous'].patchValue('');
                        stcFromGroup['controls']['type'].patchValue({
                            type: 'DisplayText',
                            Id: 1,
                        });
                        idelTextShortFrom.push({
                            idealText: '',
                            header: 'Ideal Text',
                            selected: true,
                            maxLength: 0,
                            id: 1,
                            enable: false,
                            sameLengthFlag: false,
                            minlength: 0,
                            idealTextChanged: 0,
                            orignalIdealText: '',
                        });
                        if (stcDataFromDB.data['structureSelectedRow']?.parent?.data?.description?.length > 0) {
                            updatedLangOption = [];
                            langOption.forEach((element) => {
                                const ifDescCheckPresent = stcDataFromDB.data[
                                    'structureSelectedRow'
                                ].parent?.data?.description?.find(
                                    (item) => item.language_code === element?.language_culture_name
                                );
                                updatedLangOption.push({
                                    description: ifDescCheckPresent === undefined ? '' : ifDescCheckPresent.description,
                                    language_culture_name: element.language_culture_name,
                                    language_id: element.language_id,
                                });
                            });
                        }
                        const checkSelectedLangStcDescPresent = updatedLangOption?.find(
                            (item) => item.language_id === stcDataFromDB.data['structureSelectedRow'].data.language_id
                        );

                        if (stcDataFromDB.data['structureSelectedRow'].data.Type !== 'Group') {
                            descriptionList.push({
                                description: checkSelectedLangStcDescPresent
                                    ? checkSelectedLangStcDescPresent.description
                                    : '',
                                header: stcDataFromDB.data['structureSelectedRow'].data.context,
                                selected: true,
                                id: stcDataFromDB.data['structureSelectedRow'].data.language_id,
                                oldNew: 0,
                                enable: false,
                                sameLengthFlag: false,
                            });
                        } else {
                            descriptionList.push({
                                description: checkSelectedLangStcDescPresent
                                    ? checkSelectedLangStcDescPresent.description
                                    : '',
                                header: langOption?.length > 0 ? langOption[0].language_culture_name : '',
                                selected: true,
                                id: langOption?.length > 0 ? langOption[0].language_id : 0,
                                oldNew: 0,
                                enable: false,
                                sameLengthFlag: false,
                            });
                        }
                        stcFromGroup['controls']['idelTextTabList'].patchValue({ idealTextRow: idelTextShortFrom });
                        stcFromGroup['controls']['descriptionTabList'].setValue({ descriptionRow: descriptionList });
                    }
                    if (pageTitle === 'stcdetails') {
                        stcFromGroup['controls']['enable'].patchValue(true);
                    }
                }
            }
        }
        return of({ pageTitle: pageTitle, updatedLangOption: updatedLangOption });
    }
}
