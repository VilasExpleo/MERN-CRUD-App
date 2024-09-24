import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { LazyLoadEvent, TreeNode } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { TransaltionHistory } from 'src/app/shared/models/versioning/versioning-history';
import { ApiService } from '../../api.service';
import { ProjectService } from '../project.service';
import { Roles } from 'src/Enumerations';
@Injectable({
    providedIn: 'root',
})
export class TextnodeHistoryService {
    selectedRow: TreeNode;
    historyData: TransaltionHistory[] = [];
    historyForCM;
    constructor(
        private apiService: ApiService,
        private eventBus: NgEventBus,
        private datePipe: DatePipe,
        public objProjectService: ProjectService
    ) {
        this.eventBus.on('translateData:translateObj').subscribe({
            next: (res: MetaData) => {
                if (res?.data?.type === 'table') {
                    this.selectedRow = res?.data?.rowData;
                } else {
                    this.selectedRow = res?.data?.treeNode;
                }
                this.getTextnodeHistory(null, null, res?.data?.type);
            },
        });
    }
    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }

    historyLazyLoadEvent(event: LazyLoadEvent) {
        const filArray = [];
        const filterObject = event.filters;
        const entries = Object.entries(filterObject);
        entries.forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    const dataObj = {
                        operator: item.operator,
                        column_name: key,
                        value: key === 'updated_on' ? this.datePipe.transform(item.value, 'yyyy-MM-dd') : item.value,
                        condition: item.matchMode,
                    };
                    if (item.value !== null) filArray.push(dataObj);
                });
            }
        });
        let sortObj: any = undefined;
        if (event.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            sortObj = { column_name: event.sortField, order: sortOrder };
        }
        this.getTextnodeHistory(sortObj, filArray);
    }

    getTextnodeHistory(sort, filter, type = 'structure') {
        const props = this.getProjectParameters();
        const url = `text-node-history/get-history`;
        const payload = {
            project_id: props?.projectId,
            version_id: props?.version,
            start_row: null,
            end_row: null,
            text_node_id: null,
            filter: filter,
            sort: sort || null,
            array_item_index: null,
            variant_id: null,
            language_code: this.selectedRow?.data?.TextNodeId
                ? props?.editorLanguageCode
                : this.selectedRow?.data?.context,
        };
        if (props?.role === Roles.translator || props?.role === Roles.proofreader) {
            payload['translation_request_id'] = props?.translationRequestId;
        }

        if (type === 'table') {
            payload['text_node_id'] = this.selectedRow['text_node_id'];
            payload['array_item_index'] =
                this.selectedRow?.['array_item_index'] === '_' ? null : this.selectedRow?.['array_item_index'];
            payload['variant_id'] = this.selectedRow?.['variant_id'] === '_' ? null : this.selectedRow?.['variant_id'];
            payload.language_code = props?.editorLanguageCode;
        } else {
            payload['text_node_id'] = this.selectedRow?.data?.TextNodeId
                ? this.selectedRow?.data?.TextNodeId
                : this.selectedRow?.data?.ID;
            payload['array_item_index'] = this.selectedRow?.data?.array_item_index || null;
            payload['variant_id'] = this.selectedRow?.data?.variant_id || null;
        }
        if (type !== 'table') {
            if (!!this.selectedRow?.['data']?.['TextNodeId'] || !!this.selectedRow?.['data']?.['ID']) {
                this.apiService
                    .postTypeRequest(url, payload)
                    .pipe(catchError(() => of(undefined)))
                    .subscribe({
                        next: (res) => {
                            if (res?.['status'] === 'OK' && !!res?.['data']) {
                                res['data'].map((item) => {
                                    if (item.updated_on) {
                                        item.updated_on = this.datePipe.transform(
                                            new Date(item.updated_on),
                                            'yyyy-MM-dd, hh:mm:ss a'
                                        );
                                    }
                                });
                                this.historyData = res['data'];
                            }
                        },
                    });
            } else {
                this.historyData = [];
            }
        } else {
            this.apiService
                .postTypeRequest(url, payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe({
                    next: (res) => {
                        if (res?.['status'] === 'OK') {
                            if (res?.['data']) {
                                res['data'].map((item) => {
                                    if (item.updated_on) {
                                        item.updated_on = this.datePipe.transform(
                                            new Date(item.updated_on),
                                            'yyyy-MM-dd, hh:mm:ss a'
                                        );
                                    }
                                });
                                this.historyData = res['data'];
                            }
                        }
                    },
                });
        }
    }

    getColumnData() {
        return [
            { field: 'text_node_id', header: 'Textnode ID', filterType: 'numeric' },
            { field: 'updated_on', header: 'Timestamp', filterType: 'date' },
            { field: 'user_name', header: 'User', filterType: 'text' },
            {
                field: 'attribute_name',
                header: 'Changed Attributes',
                filterType: 'text',
            },
            { field: 'language_code', header: 'Language', filterType: 'text' },
            { field: 'old_value', header: 'Old Value', filterType: 'text' },
            { field: 'new_value', header: 'New Value', filterType: 'text' },
        ];
    }
    public columnConfigMenu = [
        {
            label: 'Export',
            icon: 'pi pi-sliders-v',
            command: () => this.objProjectService.exportExcel(this.historyData, 'TextNode_History'),
        },
    ];
}
