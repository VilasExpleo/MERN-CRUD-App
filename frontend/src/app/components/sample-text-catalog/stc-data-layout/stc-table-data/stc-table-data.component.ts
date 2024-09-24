import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Brand } from 'src/app/shared/models/brand';
import { Gender, Mapped, Numerous, Type } from './../../../../../Enumerations';

@Component({
    selector: 'app-stc-table-data',
    templateUrl: './stc-table-data.component.html',
    styleUrls: ['./stc-table-data.component.scss'],
})
export class StcTableDataComponent implements OnInit {
    cols: any[];
    userInfo: any;
    userId: any;
    flatten: any;
    tablearray: any[];
    startRow: any = 0;
    filArray: any = [];
    loading = true;
    @ViewChild('datatable') table: Table;
    tableIndex = 0;
    type: any[];
    gender: any[];
    numerous: any[];
    brands: any[];
    state: any;
    totalRecords: number;
    @Output() setLayout: EventEmitter<any> = new EventEmitter();
    constructor(
        private sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private eventBus: NgEventBus,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'sequence_no', header: 'Seq No', filterType: 'numeric' },
            { field: 'stc_id', header: 'ID', filterType: 'numeric' },
            { field: 'brand_name', header: 'Brand', filterType: '' },
            { field: 'path', header: 'Group Path', filterType: 'text' },
            { field: 'type_val', header: 'Type', filterType: '' },
            { field: 'ideal_text', header: 'Ideal Text', filterType: 'text' },
            { field: 'short_form', header: 'Shortform', filterType: 'text' },
            { field: 'gender_val', header: 'Gender', filterType: '' },
            { field: 'numerous_val', header: 'Numerous', filterType: '' },
            { field: 'description', header: 'Description', filterType: 'text' },
            { field: 'mapped', header: 'Map', filterType: '' },
        ];

        this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.state = res;
        });
        this.eventBus.on('structure:create').subscribe(() => {
            let event: LazyLoadEvent;
            this.onLazyFilterTableData(event);
        });
        this.eventBus.on('stcIdByTableData:stcTable').subscribe((data: MetaData) => {
            if (data) {
                setTimeout(() => {
                    this.tablearray = [...data.data];
                }, 0);
            }
        });
    }

    onLazyFilterTableData(event: LazyLoadEvent) {
        this.loading = true;
        const postObj = this.processFilter(event);
        this.sampleTextCatalogService.STCTable('stc-table', postObj).subscribe({
            next: (res) => {
                this.loading = false;
                if (res['status'] == 'OK') {
                    this.loading = false;
                    this.sampleTextCatalogService.getStcTableData(res['data']).subscribe((response: any) => {
                        this.tablearray = response;
                        this.totalRecords = response.length;
                        if (this.filArray.length > 0) {
                            this.state.filterFlag = 1;
                            this.state.filterData = response;
                            this.sampleTextCatalogService.setSTCState(this.state);
                        } else {
                            this.state.filterFlag = 0;
                            this.state.isGroupAction = 1;
                            this.sampleTextCatalogService.setSTCState(this.state);
                        }
                    });
                }
            },
            error: () => {
                this.loading = false;
            },
        });
    }
    private processFilter(event) {
        // initial payload without filter/sort
        const postObj: any = {
            start_row: 0,
            end_row: 500,
            editor_id: this.userService.getUser().id,
        };

        // Check for filters on the table
        const filterObject = event?.filters;
        if (filterObject) {
            const entries = Object.entries(filterObject);
            this.filArray = [];
            entries.forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        if (item.value !== null) {
                            const dataObj = {
                                operator: item.operator,
                                column_name: key,
                                value: item.value,
                                condition: item.matchMode,
                            };
                            this.filArray.push(dataObj);
                        }
                    });
                }
            });
            if (this.filArray.length) {
                postObj['filter'] = this.filArray;
            }
        }
        //check for sort applied on the table
        if (event?.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            postObj['sort'] = { column_name: event.sortField, order: sortOrder };
        }
        return postObj;
    }

    onTableRowSelect(event) {
        this.selectRow(event.data);
        const payload = {
            stc_id: event.data.stc_id,
        };
        this.eventBus.cast('stc:history', payload);
    }
    getBrandsName() {
        return Brand.getAllBrands().map((e) => e.getName());
        // Refactored: return Object.values(BrandsName);
    }
    getType() {
        return Object.values(Type);
    }
    getGender() {
        return Object.values(Gender);
    }
    getNumerous() {
        return Object.values(Numerous);
    }
    getMapped() {
        return Object.values(Mapped);
    }
    selectRow(row) {
        if (row) {
            const structuredData = this.sampleTextCatalogService.getStcData(
                row.stc_id,
                this.sampleTextCatalogService.structuredData
            );
            this.state.structureSelectedRow = structuredData[structuredData.length - 1];
            this.stcDetails(row.path);
        }
    }
    stcDetails(groupPath: string) {
        const path = groupPath.split(',').map((text) => ({ label: text.trim() }));
        const data = {
            title: 'Details Of Sample Text',
            data: this.state,
            contentId: 'stc',
        };
        this.state.title = 'stcdetails';
        this.state.breadcrumbItems = path;
        this.sampleTextCatalogService.setSTCState(this.state);
        this.eventBus.cast('stc:details', data);
        this.setLayout.emit(data);
    }
    // clear Filter
    clear(table: Table) {
        table.clear();
    }

    arrayToStringWithPipe(arr) {
        // eslint-disable-next-line no-prototype-builtins
        if (arr?.[0]?.hasOwnProperty('short_form')) return arr.map((item) => item.short_form).join('|');
        else return arr.map((item) => item?.description).join('|');
    }
}
