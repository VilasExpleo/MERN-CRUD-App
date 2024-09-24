import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subscription, catchError, of } from 'rxjs';
import { Status, TextNodeStatus, TranslationStatusEnum } from 'src/Enumerations';
import { OrderStatus } from 'src/app/components/dashboard/proofreader-dashboard/proofreader.model';
import { GridService } from 'src/app/core/services/grid/grid.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { TableData } from 'src/app/shared/models/tmdata';

@Component({
    selector: 'app-filter-translation',
    templateUrl: './filter-translation.component.html',
    styleUrls: ['./filter-translation.component.scss'],
    providers: [DialogService, MessageService],
})
export class FilterTranslationComponent implements OnInit {
    langSelectionSubs: Subscription;
    filterSubs: Subscription;
    langSelectionstate;
    filterState;
    cols = [];
    filterTableData: TableData[];
    loading: boolean;
    nodeList = [];
    filArray = [];
    payload: object = {};
    prevFilter;
    chooseFilterConfigForm: UntypedFormGroup;
    newFilterConfigForm: UntypedFormGroup;
    configurationsName = [];
    userInfo: object;
    templateName: string;
    isDeleteTemplateDisabled = true;
    isCheckboxChecked = true;
    unfinishedNodes = true;
    isSaveTemplateDisable = true;
    textNodeStatus = TextNodeStatus;
    defaultStatus = 'N/A';
    stateStatus;
    orderStatus: OrderStatus[] = [
        { id: '2', label: 'Pending' },
        { id: '3', label: 'Approved' },
        { id: '4', label: 'Rejected' },
    ];
    lockedStatus = [
        { label: 'Unlocked', value: 'Unlocked' },
        { label: 'Locked', value: 'locked' },
    ];

    @ViewChild('filterTable') filterTable: Table;

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(
        private router: Router,
        public translationRequestService: TranslationRequestService,
        private fb: UntypedFormBuilder,
        private primengConfig: PrimeNGConfig,
        private userService: UserService,
        private messageService: MessageService,
        private readonly gridService: GridService
    ) {}

    ngOnInit(): void {
        this.userInfo = this.userService.getUser();
        this.stateStatus = this.gridService.getFilterFromNumericEnum(TranslationStatusEnum);
        this.getSavedTemplateList();
        this.langSelectionSubs = this.translationRequestService.getLangSelectionState().subscribe((res) => {
            this.langSelectionstate = res;
        });
        this.cols = this.translationRequestService.getTableColumns(this.langSelectionstate.sourseLanguage['name']);
        this.chooseFilterConfigForm = this.fb.group({
            availableConfigName: '',
        });
        this.newFilterConfigForm = this.fb.group({
            newConfigName: '',
        });
        this.filterSubs = this.translationRequestService.getFilterState().subscribe({
            next: (res) => {
                if (res !== null) {
                    this.filterState = res;
                    this.templateName = this?.filterState?.templateName;
                    if (this?.filterState?.templateName) {
                        this.displaySelectedDropdownValue();
                    }
                    this.filArray = res?.filterObject;
                    this.unfinishedNodes = res.unfinishedNodes;
                }
            },
        });

        this.primengConfig.ripple = true;
        this.loading = true;
    }

    navigate(index: number) {
        this.translationRequestService.setFilterState({
            nodeList: this.nodeList,
            payload: this.payload,
            unfinishedNodes: this.unfinishedNodes,
            filterObject: this.filArray,
            templateName: this.templateName,
        });
        this.navigationEvent.emit(index);
    }
    onLazyFilterTableData(event: LazyLoadEvent) {
        this.loading = true;
        this.filArray = [];
        this.nodeList = [];

        const url = `tabular-format/table-data`;
        // initial payload without filter/sort

        this.payload = {
            project_id: this.langSelectionstate.projectId,
            version_id: this.langSelectionstate.versioNo,
            language_code: this.langSelectionstate.sourseLanguage.name,
            start_row: 0,
            end_row: 100,
        };

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
                    if (item.value !== null) this.filArray.push(dataObj);
                });
            }
        });
        if (this.filArray?.length || this.filterState?.filterObject?.length) {
            this.payload['filter'] = this.filArray?.length > 0 ? this.filArray : this.filterState?.filterObject;
        }

        //check for sort applied on the table

        if (event.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            this.payload['sort'] = { column_name: event.sortField, order: sortOrder };
        }

        this.translationRequestService
            .getTableDataForTRFilter(url, this.payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.filterTableData = res['data'];
                    this.createStatisticsData(res['data']);
                    this.loading = false;
                }
            });
    }

    getStatus(state) {
        let num;
        if (state == 'Done') {
            num = 1;
        }
        if (state == 'Work in progress') {
            num = 2;
        }
        if (state == 'Unworked') {
            num = 3;
        }

        return Status[num];
    }
    submitChooseFilterConfigForm(form_data) {
        this.templateName = form_data?.availableConfigName?.template_name;
        this.applySelectedFilter();
    }
    applySelectedFilter() {
        this.displaySelectedDropdownValue();
        this.loading = true;
        const url = `translation-request/getTemplate`;
        const data = {
            editor_id: this.userInfo?.['id'],
            project_id: this.langSelectionstate?.projectId,
            version_id: this.langSelectionstate?.versioNo,
            language_code: this.langSelectionstate?.sourseLanguage?.name,
            start_row: 0,
            end_row: 100,
            template_name: this.templateName,
        };
        this.translationRequestService
            .getSavedTemplateList(url, data)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.filterTableData = res?.['data']?.['data'];
                    this.filArray = res?.['data']?.['filter_data'];
                    this.unfinishedNodes = res?.['data']?.export;
                    this.loading = false;
                    this.createStatisticsData(res?.['data']?.['data']);
                }
            });
    }
    getCheckboxValue(event) {
        this.isCheckboxChecked = event?.checked;
    }
    submitNewFilterConfigForm(form_data) {
        const updateConfigURL = `translation-request/update`;
        const url = `translation-request/saveTemplateTranslationRequestFilter`;
        const data = {
            created_by: this.userInfo?.['id'],
            editor_id: this.userInfo?.['id'],
            template_name: form_data.newConfigName,
            export: this.isCheckboxChecked,
            filter_data: this.filArray,
        };

        const isTemplatepresent = this.configurationsName.find(
            (item) => item.template_name === form_data.newConfigName
        );
        if (isTemplatepresent) {
            const updateConfigData = {
                editor_id: this.userInfo?.['id'],
                template_name: form_data.newConfigName,
                filter_data: this.filArray,
            };
            this.translationRequestService
                .saveTRFilterTemplete(updateConfigURL, updateConfigData)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res?.['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Template updated successfully',
                        });
                        this.getSavedTemplateList();
                    }
                });
        } else {
            this.translationRequestService
                .saveTRFilterTemplete(url, data)
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res?.['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Template saved successfully',
                        });
                        this.getSavedTemplateList();
                    }
                });
        }

        this.newFilterConfigForm.reset();
    }

    getSavedTemplateList() {
        const getallTemplatesURL = `translation-request/getallTemplates`;
        this.translationRequestService
            .getSavedTemplateList(getallTemplatesURL, {
                editor_id: this.userInfo?.['id'],
            })
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.configurationsName = res['data'];
                }
            });
    }

    getTemplateName(event) {
        if (event?.value) {
            this.isDeleteTemplateDisabled = false;
            this.templateName = event?.value?.template_name;
        }
    }
    deleteFilterConfig() {
        const url = `translation-request/delete`;
        const data = {
            editor_id: this.userInfo?.['id'],
            template_name: this.templateName,
        };
        this.loading = true;

        this.translationRequestService
            .deleteFilterConfig(url, data)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Deleted',
                        detail: 'Template deteted successfully',
                    });
                    this.getSavedTemplateList();
                    this.clearFilter();
                    this.loading = false;
                }
            });
    }
    clearFilter() {
        this.loading = true;
        const url = `tabular-format/table-data`;
        // initial payload without filter/sort

        this.payload = {
            project_id: this.langSelectionstate.projectId,
            version_id: this.langSelectionstate.versioNo,
            language_code: this.langSelectionstate.sourseLanguage.name,
            start_row: 0,
            end_row: 100,
        };

        this.translationRequestService
            .getTableDataForTRFilter(url, this.payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.filterTableData = res['data'];
                    this.createStatisticsData(res['data']);
                    this.loading = false;
                    this.chooseFilterConfigForm.reset();
                }
            });
        this.templateName = null;
        this.isDeleteTemplateDisabled = true;
    }
    private createStatisticsData(response) {
        this.nodeList = response.map(({ variant_id, array_item_index, text_node_id }) => {
            return {
                text_node_id: text_node_id,
                variant_id: variant_id == '_' ? null : variant_id,
                array_item_index: array_item_index == '_' ? null : array_item_index,
            };
        });
    }
    private displaySelectedDropdownValue() {
        this.chooseFilterConfigForm.patchValue({
            availableConfigName: { template_name: this.templateName },
        });
        this.isDeleteTemplateDisabled = false;
    }

    getInputValue(event) {
        this.isSaveTemplateDisable = !event.target.value;
    }

    isColumnProofreadStatusOrReviewerStatus(column: string): boolean {
        return column === 'review_status' || column === 'proofread_status';
    }
    isColumnEditorLanguageStatus(column: string): boolean {
        return column === 'source_status';
    }

    isColumnEditorLockStatus(column: string): boolean {
        return column === 'locked';
    }

    isShowColumnFilter(column: string): boolean {
        return (
            column !== 'review_status' &&
            column !== 'proofread_status' &&
            column !== 'source_status' &&
            column !== 'locked'
        );
    }
}
