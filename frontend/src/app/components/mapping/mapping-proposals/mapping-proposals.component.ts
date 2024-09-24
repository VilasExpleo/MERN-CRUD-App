import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgEventBus } from 'ng-event-bus';
import { Message } from 'primeng//api';
import { LazyLoadEvent, MessageService, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { catchError, of } from 'rxjs';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Brand } from 'src/app/shared/models/brand';
import { ImappingProposalsTableData } from 'src/app/shared/models/mapping/mappingdata';

@Component({
    selector: 'app-mapping-proposals',
    templateUrl: './mapping-proposals.component.html',
    styleUrls: ['./mapping-proposals.component.scss'],
    providers: [MessageService],
})
export class MappingProposalsComponent implements OnInit, OnChanges {
    constructor(
        private objMappingService: MappingService,
        private userService: UserService,
        private router: Router,
        private eventBus: NgEventBus,
        private messageService: MessageService
    ) {}

    ngOnChanges(): void {
        if (this.readonlyText != '') {
            this.getMappingPropData();
        }
    }

    columsMappingProp = [];
    filterMappingPropData: ImappingProposalsTableData[];
    loading = false;
    filterArray = [];
    @ViewChild('mappingFilterTabel') mappingFilterTabel: Table;
    @Output() getDataFromChild: EventEmitter<any> = new EventEmitter();
    @Input() translationText = '';
    @Input() textNodeTypeForMP = '';
    @Input() projectTranslateID: number;
    @Input() itIsMappingSettingDone = true;
    @Input() versionNumber: number;
    @Input() editorLanguageCode = '';
    @Input() structureRow;
    @Input() readonlyText = '';
    totalRecords: number;
    commanMappingData = [];
    msgs: Message[] = [];
    ngOnInit(): void {
        this.msgs.push({
            severity: 'info',
            summary: 'Info Message',
            detail: 'Please configure your Source Language in Global > Settings > Mapping > Language Selections',
        });
        this.columsMappingProp = this.objMappingService.getMappingProposalsTabelColumns();
        this.eventBus.on('Map:clearData').subscribe(() => {
            this.clearMappingTableData();
        });
    }
    onLazyMappingPropTableData(event: LazyLoadEvent) {
        if (this.readonlyText != '') {
            this.loading = true;
            this.filterArray = [];
            const payload = {};
            // Check for filters on the table
            const filterObject = event.filters;
            const entries = Object.entries(filterObject);
            entries.forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        const dataObj = {
                            operator: item.operator,
                            column_name: key,
                            value: item.value,
                            condition: item.matchMode,
                        };
                        if (item.value !== null) this.filterArray.push(dataObj);
                    });
                }
            });
            if (this.filterArray.length) {
                payload['filter'] = this.filterArray;
            }
            if (event.sortField) {
                const sortOrder = event?.sortOrder === -1 ? 'desc' : 'asc';
                payload['sort'] = { column_name: event.sortField, order: sortOrder };
            }
            if (this.filterArray.length > 0) {
                this.objMappingService
                    .getMappingProosalsTabelData(this.filterArray, this.filterMappingPropData)
                    .subscribe((res) => {
                        this.filterMappingPropData = res;
                        this.loading = false;
                    });
            } else {
                if (this.commanMappingData) {
                    this.filterMappingPropData = this.commanMappingData.slice(event.first, event.first + event.rows);
                    this.loading = false;
                }
            }
            this.customSort(event);
        }
    }

    sampleTextCatalogPage(stcId) {
        this.eventBus.cast('stc:mappingProposals', stcId);
        const navigationExtras: any = { Id: stcId };
        const url = this.router.serializeUrl(this.router.createUrlTree(['main/sample-text-catalog', navigationExtras]));
        window.open(url, '_blank');
    }
    rowDbClick(event, data) {
        if (data != undefined) {
            if (
                data?.brand_name.trim()?.toLocaleLowerCase() ===
                this.userService.getUser().brand_name.trim().toLocaleLowerCase()
            ) {
                this.saveMappingData(data);
            } else {
                this.createSTCForOtherBandOfMapping(data);
            }
        }
    }

    getMappingPropData() {
        const payload = {
            editor_id: this.userService?.getUser()?.id,
            editor_brand_id: this.userService?.getUser()?.brand_id,
            textnode_text: this.readonlyText,
            textnode_type:
                this.textNodeTypeForMP === '_' ||
                this.textNodeTypeForMP === '-' ||
                this.textNodeTypeForMP === 'DisplayMessage'
                    ? 'StandardText'
                    : this.textNodeTypeForMP,
            project_id: this.projectTranslateID,
        };
        const url = `project-mapping/get-mapping-suggestion`;
        if (this.readonlyText != '') {
            this.objMappingService
                .getMappingPropsalsData(url, payload)
                .pipe(catchError((error) => of(error)))
                .subscribe((response) => {
                    if (response) {
                        this.objMappingService.getMappingDataByModel(response['data']).subscribe((res) => {
                            this.commanMappingData = res;
                            this.filterMappingPropData = res;
                            this.totalRecords = this.filterMappingPropData.length;
                        });
                    }
                });
        }
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
    getBrandLogo(num) {
        return Brand.getBrand(num).getLogo();
        // Refactored: return BrandLogoEnum[num];
    }
    getAltText(num) {
        return Brand.getBrand(num).getName();
        // Refactored: return BrandEnum[num];
    }
    saveMappingData(data) {
        let paylod: any = {};
        paylod = {
            project_id: this?.projectTranslateID,
            version_id: this?.versionNumber === undefined ? null : this?.versionNumber,
            editor_id: this.userService?.getUser()?.id,
            textnode_id:
                this.structureRow?.data?.TextNodeId === undefined
                    ? this.structureRow.parent.data.TextNodeId
                    : this.structureRow?.data?.TextNodeId,
            variant_id: this.structureRow?.data?.variant_id === undefined ? null : this.structureRow?.data?.variant_id,
            array_item_index:
                this.structureRow?.data?.array_item_index === undefined
                    ? null
                    : this.structureRow?.data?.array_item_index,
            stc_master_id: data.stc_id,
            textnode_language_id: data.language_Id,
        };
        if (this.structureRow.data.mapped !== 'Yes') {
            if (paylod) {
                this.objMappingService
                    .saveMappingData(`project-mapping/save-mapping-data`, paylod)
                    .pipe(catchError((error) => of(error)))
                    .subscribe((response) => {
                        if (response) {
                            if (response['status'] === 'Ok') {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: response['message'],
                                });
                                this.getDataFromChild.emit({
                                    data: data?.ideal_text,
                                    Map: 'Yes',
                                });
                                paylod['parent_stc_id'] = this.structureRow?.data?.parent_stc_id;
                                paylod['language_id'] = data.language_Id;
                                this.eventBus.cast('prop: MappedData', paylod);
                                this.eventBus.cast('stcDataAfterM:stcDataAfterMapping', data);
                            } else {
                                this.messageService.add({
                                    severity: 'warn',
                                    summary: 'Warning',
                                    detail: response['message'],
                                });
                            }
                        }
                    });
            }
        } else {
            if (paylod) {
                paylod['flag'] = 'update_mapping';
                this.objMappingService
                    .saveMappingData(`project-mapping/update-mapping-data`, paylod)
                    .pipe(catchError((error) => of(error)))
                    .subscribe((response) => {
                        if (response) {
                            if (response['status'] === 'Ok') {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: response['message'],
                                });
                                this.getDataFromChild.emit({
                                    data: data?.ideal_text,
                                    Map: 'Yes',
                                });
                                paylod['language_id'] = data.language_Id;
                                this.eventBus.cast('prop: MappedData', paylod);
                                this.eventBus.cast('stcDataAfterM:stcDataAfterMapping', data);
                            } else {
                                this.messageService.add({
                                    severity: 'warn',
                                    summary: 'Warning',
                                    detail: response['message'],
                                });
                            }
                        }
                    });
            }
        }
    }
    createSTCForOtherBandOfMapping(data) {
        const payload: any = {
            brand_id: this.userService?.getUser()?.brand_id,
            editor_id: this.userService?.getUser()?.id,
            parent_stc_id: data?.parent_stc_id,
            language_id: data?.language_id,
            project_id: this?.projectTranslateID === undefined ? null : this?.projectTranslateID,
            version_id: this?.versionNumber === undefined ? null : this?.versionNumber,
            textnode_id: this.structureRow?.data?.TextNodeId === undefined ? null : this.structureRow?.data?.TextNodeId,
            variant_id: null,
            array_item_index: null,
            stc_id: data?.parent_stc_id,
        };

        this.objMappingService
            .saveStcDataOfOtherBrand('project-mapping/copy-mapped-stc', payload)
            .pipe(catchError((error) => of(error)))
            .subscribe((response) => {
                if (response) {
                    if (response['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response['message'],
                        });
                        this.getDataFromChild.emit({ data: data?.ideal_text, Map: 'Yes' });
                        this.eventBus.cast('prop: MappedData', payload);
                        this.eventBus.cast('stcDataAfterM:stcDataAfterMapping', data);
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: response['message'],
                        });
                    }
                }
            });
    }
    clearMappingTableData() {
        this.filterMappingPropData = [];
        this.totalRecords = 0;
        this.commanMappingData = [];
    }
}
