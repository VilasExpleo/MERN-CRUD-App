import { Injectable } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { Message, MessageService, SortEvent, TreeNode } from 'primeng/api';

import { Observable, catchError, of } from 'rxjs';
import { STCType, UsersRoles } from 'src/Enumerations';
import { ImappingProposalsTableData } from '../../../shared/models/mapping/mappingdata';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

import { Brand } from 'src/app/shared/models/brand';

@Injectable({
    providedIn: 'root',
})
export class MappingService {
    itIsMappingSettingDone = true;
    commanMappingData = [];
    filterMappingPropData = [];
    selectedData;
    loading = false;
    totalRecords: number;
    msgs: Message[] = [];
    readonlyText = '';
    filterArray = [];
    selectedRow: TreeNode;
    selectedForRowVersion;
    isUnmappedEnabled = false;
    selectedTabelRowDataForMappingProposal;
    constructor(
        private apiService: ApiService,
        private eventBus: NgEventBus,
        private userService: UserService,
        private messageService: MessageService
    ) {
        this.eventBus.on('translateData:translateObj').subscribe({
            next: (res: MetaData) => {
                let mapped: string;
                this.selectedRow = res?.data?.treeNode;
                this.readonlyText = res?.data?.translateObj?.source;
                if (res?.data?.type === 'table') {
                    const rowData = res?.data.rowData;
                    this.selectedData = res?.data;
                    this.selectedData.type = 'table';
                    mapped = rowData.mapped;
                    this.getMappingPropData();
                } else {
                    if (
                        // eslint-disable-next-line no-prototype-builtins
                        res?.data?.treeNode.data.hasOwnProperty('TextNodeId') ||
                        // eslint-disable-next-line no-prototype-builtins
                        res?.data?.treeNode.data.hasOwnProperty('ID')
                    ) {
                        if (res?.data) {
                            this.getMappingPropData();
                        }
                        this.selectedData = this.selectedRow;
                        this.selectedData.type = 'structure';
                        mapped = this.selectedRow?.['data']?.['mapped']
                            ? this.selectedRow?.['data']?.['mapped']
                            : this.selectedRow?.['parent']?.['data']?.['mapped'];
                    }
                }

                if (mapped === 'Yes') {
                    this.idMapNewVersion(this.selectedData);
                    if (this.userRole === UsersRoles.Editor) {
                        this.isUnmappedEnabled = true;
                    }
                } else {
                    this.eventBus.cast('idMapNewVersion:idMapNewVersionTextNode', {});
                    this.isUnmappedEnabled = false;
                }
            },
        });
        this.getProjectParameters();
        this.msgs.push({
            severity: 'info',
            summary: 'Info Message',
            detail: 'Please configure your Source Language in Global > Settings > Mapping > Language Selections',
        });
        this.eventBus.on('Map:clearData').subscribe(() => {
            this.clearMappingTableData();
        });
        this.eventBus.on('globalSetting:afterSaveSettings').subscribe(() => {
            this.getMappingPropData();
            this.itIsMappingSettingDone = false;
        });
    }
    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            return JSON.parse(localStorage.getItem('projectProps'));
        }
    }

    getMappingPropData() {
        const props = this.getProjectParameters();
        const payload = {
            editor_id: props?.userProps?.id,
            editor_brand_id: props?.userProps?.brand_id,
            textnode_text: this.readonlyText,
            textnode_type:
                this.selectedRow?.['data']?.['text_node_type'] === '_' ||
                this.selectedRow?.['data']?.['text_node_type'] === '-' ||
                this.selectedRow?.['data']?.['text_node_type'] === 'DisplayMessage'
                    ? 'StandardText'
                    : this.selectedRow?.['data']?.['text_node_type'],
            project_id: props?.projectId,
        };
        const url = `project-mapping/get-mapping-suggestion`;
        if (this.readonlyText != '') {
            this.getMappingPropsalsData(url, payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response) => {
                    if (response) {
                        this.getMappingDataByModel(response['data'])
                            .pipe(catchError(() => of(undefined)))
                            .subscribe({
                                next: (res) => {
                                    if (res) {
                                        this.commanMappingData = res;
                                        this.filterMappingPropData = res;
                                        this.totalRecords = this.filterMappingPropData.length;
                                    }
                                },
                            });
                    }
                });
        } else {
            this.filterMappingPropData = [];
        }
    }

    rowDbClick(row) {
        let url;
        const props = this.getProjectParameters();
        if (row != undefined) {
            if (
                row?.brand_name.trim()?.toLocaleLowerCase() ===
                this.userService.getUser().brand_name.trim().toLocaleLowerCase()
            ) {
                let langIdForMapping;
                let selectedTabelRow;
                let mapped: string;
                if (this.selectedTabelRowDataForMappingProposal) {
                    const mapObjectOftabelRowSelect = this.selectedTabelRowDataForMappingProposal;
                    selectedTabelRow = this.selectedTabelRowDataForMappingProposal.tabelRow;
                    mapped = selectedTabelRow.mapped;
                    langIdForMapping =
                        mapObjectOftabelRowSelect?.tabelColumn?.langId === ''
                            ? mapObjectOftabelRowSelect.editorLangId
                            : mapObjectOftabelRowSelect?.tabelColumn?.langId;
                } else {
                    langIdForMapping = this.selectedRow?.['data']?.['language_id'];
                    mapped = this.selectedRow?.['data']?.['mapped'];
                }
                const forMappingObj = {
                    textnode_id: this.getTextNodeId(selectedTabelRow, this.selectedRow),
                    variant_id: selectedTabelRow
                        ? selectedTabelRow.variant_id
                        : this.selectedRow?.['data']?.['variant_id'],
                    array_item_index: selectedTabelRow
                        ? selectedTabelRow.array_item_index
                        : this.selectedRow?.['data']?.['array_item_index'],
                };

                const payload = {
                    project_id: props?.projectId,
                    version_id: props?.version,
                    editor_id: props?.userProps?.id,
                    textnode_id: forMappingObj.textnode_id === '_' ? null : forMappingObj.textnode_id,
                    variant_id: forMappingObj.variant_id === '_' ? null : forMappingObj.variant_id,
                    array_item_index: forMappingObj.array_item_index === '_' ? null : forMappingObj.array_item_index,
                    stc_master_id: row.stc_id,
                    textnode_language_id: langIdForMapping,
                    flag: 'update_mapping',
                };

                if (mapped === 'No') {
                    url = `project-mapping/save-mapping-data`;
                } else {
                    url = `project-mapping/update-mapping-data`;
                }

                this.apiService
                    .postTypeRequest(url, payload)
                    .pipe(catchError(() => of(undefined)))
                    .subscribe({
                        next: (res) => {
                            if (res?.['status'] === 'Ok') {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: res['message'],
                                });
                                this.selectedRow['data']['mapped'] = 'Yes';

                                if (this.selectedTabelRowDataForMappingProposal) {
                                    this.selectedTabelRowDataForMappingProposal.tabelRow.mapped = 'Yes';
                                    const langWiseData =
                                        this.selectedTabelRowDataForMappingProposal.tabelRow.language_data.find(
                                            (item) =>
                                                item.language_id ===
                                                this.selectedTabelRowDataForMappingProposal.editorLangId
                                        );
                                    if (langWiseData) {
                                        langWiseData.language_props.find((item) => item.prop_name === 'Text').value =
                                            row?.ideal_text;
                                        langWiseData.language_props.find((item) => item.prop_name === 'State').value =
                                            'Work in progress';
                                    }
                                }
                                this.eventBus.cast('structure:textnodeupdate', res);
                                this.eventBus.cast('mapping:mappingtablerow', row);
                            } else {
                                this.messageService.add({
                                    severity: 'warn',
                                    summary: 'Warning',
                                    detail: res['message'],
                                });
                            }
                        },
                    });
            } else {
                this.createSTCForOtherBandOfMapping(row);
            }
        }
    }

    getMappingProposalsTabelColumns() {
        return [
            { field: 'sequence_no', header: 'Seq No', type: 'numeric' },
            { field: 'ideal_text', header: 'STC Entry', type: 'text' },
            { field: 'stc_id', header: 'STC Link', type: 'numeric' },
            { field: 'language_code', header: 'Language', type: 'text' },
            { field: 'rating', header: 'Rating', type: 'numeric' },
            { field: 'brand_name', header: 'Brand', type: 'text' },
            { field: 'description', header: 'Description', type: 'text' },
            { field: 'type', header: 'Type', type: 'text' },
            { field: 'project', header: 'Project', type: 'text' },
            { field: 'numerous', header: 'Numerous', type: 'text' },
            { field: 'gender', header: 'Gender', type: 'text' },
            { field: 'brand_id', header: 'brand_id', type: 'numeric' },
        ];
    }
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            const value1 = data1[event.field];
            const value2 = data2[event.field];
            let result = 0;
            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else if (value1 !== value2) {
                result = value1 < value2 ? -1 : 1;
            }
            return event.order * result;
        });
    }
    getMappingProosalsTabelData(paylod, lastMappingData): Observable<any> {
        let mappingProposalsTableDataList = [];
        let result = [];
        mappingProposalsTableDataList = lastMappingData;
        if (paylod.length > 0) {
            result = mappingProposalsTableDataList.filter(function (mapping) {
                return paylod.some(function (filter) {
                    return mapping[filter.column_name] === filter.value;
                });
            });
        } else {
            result = mappingProposalsTableDataList;
        }
        return of(result);
    }
    getMappingPropsalsData(url, paylod) {
        return this.apiService.postTypeRequest(url, paylod);
    }
    filterObject(filed, value) {
        return filed === value;
    }
    saveMappingSetting(url, formValue, languages) {
        const payload: any = {
            editor_id: formValue.editor_id,
            languages: languages.map((item) => item.language_id),
            editor_preference: [
                {
                    min_score: formValue.minimumScore,
                    max_result: formValue.maximumResult,
                    multi_translation_penalty: formValue.mutipleTranslations,
                    texttype_penalty: formValue.textType,
                    project_penalty: formValue.project,
                    brand_penalty: formValue.brand,
                    match_ideal_form: formValue.matchhandling === 'match_ideal_form' ? 1 : 0,
                    match_any_form: formValue.matchhandling === 'match_any_form' ? 1 : 0,
                    status_stc: formValue?.statushandling.find((item) => item === 'status_mapping') ? 1 : 0,
                    reset_stc_status: formValue?.statushandling.find((item) => item === 'status_unmapping') ? 1 : 0,
                },
            ],
        };
        return this.apiService.postTypeRequest(url, payload);
    }
    getMappingSettingDetailsByEditorID(paylod) {
        const url = 'editor-mapping-preference/editorMappingPreferenceDetails';
        return this.apiService.postTypeRequest(url, paylod);
    }
    saveMappingData(url, payload) {
        return this.apiService.postTypeRequest(url, payload);
    }
    getSTCDetails(url, paylod) {
        return this.apiService.postTypeRequest(url, paylod);
    }
    getStcDetailsByStcIdAfterApiCall(payload): Observable<any> {
        const stcDetails: any = [];
        if (payload.length > 0) {
            const objIdealText: any = {
                Forms: 'Ideal Text',
                Rating: 100,
                Text: payload[0].ideal_text,
                selected: false,
                id: payload[0].id,
            };
            stcDetails.push(objIdealText);
            if (payload[0].stc_shortforms.length > 0) {
                payload[0].stc_shortforms.map((item, index) => {
                    const objShotForm: any = {
                        Forms: 'Short Form ' + (index + 1),
                        Rating: 100,
                        Text: item.short_form,
                        selected: false,
                        id: item.id,
                    };
                    stcDetails.push(objShotForm);
                });
            }
        }
        return of(stcDetails);
    }
    saveStcDataOfOtherBrand(url, paylod) {
        return this.apiService.postTypeRequest(url, paylod);
    }
    getMappingDataByModel(result): Observable<ImappingProposalsTableData[]> {
        const list: ImappingProposalsTableData[] = [];
        result.map((element, index) => {
            const objMappingProposal = new ImappingProposalsTableData();
            objMappingProposal.gender = element.gender;
            objMappingProposal.brand_id = element.brand_id;
            objMappingProposal.brand_name = element.brand_name;
            objMappingProposal.rating = element.rating;
            objMappingProposal.stc_id = element.stc_id;
            objMappingProposal.ideal_text = element.ideal_text;
            objMappingProposal.type = element.type;
            objMappingProposal.language_code = element.language_code;
            objMappingProposal.language_Id = element.language_id;
            objMappingProposal.numerous = element.numerous;
            objMappingProposal.project = element.project;
            objMappingProposal.type = element.type;
            objMappingProposal.parent_stc_id = element.parent_stc_id;
            objMappingProposal.description = element.description.length > 0 ? element.description[0].description : '';
            objMappingProposal.sequence_no = index + 1;
            list.push(objMappingProposal);
        });
        return of(list);
    }

    createSTCForOtherBandOfMapping(data) {
        const props = this.getProjectParameters();
        const url = `project-mapping/copy-mapped-stc`;
        const payload: any = {
            brand_id: props?.userProps?.brand_id,
            editor_id: props?.userProps?.id,
            parent_stc_id: data?.['parent_stc_id'],
            language_id: data?.['language_Id'],
            project_id: props?.projectId,
            version_id: props?.version,
            textnode_id: this.selectedRow?.['data']?.['TextNodeId']
                ? this.selectedRow?.['data']?.['TextNodeId']
                : this.selectedRow?.['parent']?.['data']?.['TextNodeId'],
            variant_id: this.selectedRow?.['data']?.['variant_id'],
            array_item_index: this.selectedRow?.['data']?.['array_item_index'],
            stc_id: data?.['stc_id'],
        };
        this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res['message'],
                        });
                        this.selectedRow['data']['mapped'] = 'Yes';
                        this.eventBus.cast('structure:textnodeupdate', res);
                        this.eventBus.cast('mapping:mappingtablerow', data);
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: res['message'],
                        });
                    }
                },
            });
    }
    getBrandLogo(num) {
        return Brand.getBrand(num)?.getLogo();
        // Refactored: return BrandLogoEnum[num];
    }
    getAltText(num) {
        return Brand.getBrand(num)?.getName();
        // Refactored: return BrandEnum[num];
    }
    mappingAssistent(url, paylod) {
        return this.apiService.postTypeRequest(url, paylod);
    }
    clearMappingTableData() {
        this.filterMappingPropData = [];
        this.totalRecords = 0;
        this.commanMappingData = [];
    }

    getMappingSettingDataPresent() {
        const paylod: any = {
            editor_id: this.userService.getUser().id,
        };
        if (paylod) {
            this.getMappingSettingDetailsByEditorID(paylod).subscribe((res) => {
                if (res) {
                    if (res['status'] === 'OK') {
                        if (Object.keys(res['data']).length === 0) {
                            this.itIsMappingSettingDone = true;
                        } else {
                            this.itIsMappingSettingDone = false;
                        }
                    }
                }
            });
        }
    }

    unmapText() {
        const props = this.getProjectParameters();
        const url = `project-mapping/unmapped-text`;
        let payload: any;
        if (this.selectedTabelRowDataForMappingProposal) {
            const tabelRow = this.selectedTabelRowDataForMappingProposal.tabelRow;
            payload = {
                project_id: props?.projectId,
                version_id: props?.version,
                editor_id: props?.userProps?.id,
                textnode_id: tabelRow.text_node_id,
                variant_id: tabelRow.variant_id === '_' ? null : tabelRow.variant_id,
                array_item_index: tabelRow.array_item_index === '_' ? null : tabelRow.array_item_index,
                language_id: props?.editorLanguageId,
            };
        } else {
            payload = {
                project_id: props?.projectId,
                version_id: props?.version,
                editor_id: props?.userProps?.id,
                textnode_id: this.selectedRow?.['data']?.['TextNodeId'],
                variant_id: this.selectedRow?.['data']?.['variant_id'],
                array_item_index: this.selectedRow?.['data']?.['array_item_index'],
                language_id: props?.editorLanguageId,
            };
        }
        this.apiService
            .patchTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.isUnmappedEnabled = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res['message'],
                        });
                        if (this.selectedTabelRowDataForMappingProposal) {
                            this.selectedTabelRowDataForMappingProposal.tabelRow['mapped'] = 'No';
                        } else {
                            this.selectedRow['data']['mapped'] = 'No';
                            this.eventBus.cast('structure:textnodeupdate', res);
                        }
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: res['message'],
                        });
                    }
                },
            });
    }
    idMapNewVersion(data) {
        const payload = {
            stc_id: 0,
            text: '',
        };
        this.selectedForRowVersion = data;
        if (data.type == 'table') {
            const isStcFind = data.rowData.language_data.find(
                (e) => e.language_code == data.editorLangWiseDataFromAPI.language_code
            );
            const tranlationText = isStcFind.language_props.find((e) => e.prop_name == 'Text');
            payload.stc_id = isStcFind.stc_master_id !== '_' ? isStcFind.stc_master_id : null;
            payload.text = tranlationText.value !== '_' ? tranlationText.value : null;
        } else {
            payload.stc_id = data.data.stc_master_id !== '_' ? data.data.stc_master_id : null;
            payload.text = data.data.translation !== '' ? data.data.translation : null;
        }
        const url = 'stc-history/get-stc-version';
        this.getStcVersion(url, payload);
    }
    getStcVersion(url, payload) {
        this.apiService.postTypeRequest(url, payload).subscribe({
            next: (res: any) => {
                if (res.status == 'OK') {
                    const data = {
                        nodeData: this.selectedForRowVersion,
                        getstcversion: res?.data,
                    };
                    res.data = res.data.map((stcData: any) => {
                        if (stcData.attribute_name === 'STC Type') {
                            stcData.new_value = STCType[stcData.new_value];
                            stcData.old_value = STCType[stcData.old_value];
                        }
                    });
                    this.eventBus.cast('idMapNewVersion:idMapNewVersionTextNode', data);
                } else {
                    this.eventBus.cast('idMapNewVersion:idMapNewVersionTextNode', {});
                }
            },
        });
    }
    mapNewVersionData(data: any) {
        const url = `stc-history/update-stc-version`;
        return this.apiService.patchTypeRequest(url, data);
    }
    private getTextNodeId(selectedTabelRow, selectedRow) {
        if (selectedTabelRow) {
            return selectedTabelRow.text_node_id;
        } else {
            return selectedRow?.['data']?.['TextNodeId'] ?? selectedRow?.['parent']?.['data']?.['TextNodeId'];
        }
    }
    get userRole(): number {
        return this.userService.getUser().role;
    }
}
