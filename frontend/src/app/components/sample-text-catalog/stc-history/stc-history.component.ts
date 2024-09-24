import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { LazyLoadEvent } from 'primeng/api';
import { SampleTextAttributes, tableIcons } from 'src/Enumerations';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { IstcHistoryPayload, STCHistory } from 'src/app/shared/models/versioning/versioning-history';
import { SampleTextCatalogService } from './../../../core/services/sample-text-catalog-service/sample-text-catalog.service';

@Component({
    selector: 'app-stc-history',
    templateUrl: './stc-history.component.html',
})
export class StcHistoryComponent implements OnInit {
    filArray = [];
    loading = true;
    payloadData: IstcHistoryPayload = {};
    stcHistory;
    tableIcons = tableIcons;
    stcHistoryData: STCHistory[] = [];
    constructor(
        private sampleTextCatalogService: SampleTextCatalogService,
        private eventBus: NgEventBus,
        private date: DatePipe,
        public objProjectService: ProjectService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('stc:history').subscribe((res) => {
            this.payloadData = res?.data;
            this.getStcHistoryData(this.payloadData);
        });
    }

    stcHistoryDataLazy(event: LazyLoadEvent) {
        this.stcHistoryData = [];
        this.processFilters(event?.filters);
        this.checkSortedOrder(event);
        this.getStcHistoryData(this.payloadData);
    }
    private processFilters(filters) {
        if (!filters) return;
        this.filArray = [];
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item.value !== null) {
                        const dataObj = {
                            operator: item.operator,
                            column_name: key,
                            value: key === 'updated_on' ? this.date.transform(item.value, 'yyyy-MM-dd') : item.value,
                            condition: item.matchMode,
                        };
                        this.filArray.push(dataObj);
                    }
                });
            }
        });
        if (this.payloadData) {
            this.payloadData['filter'] = this.filArray;
        }
    }
    private checkSortedOrder(event) {
        if (event?.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            this.payloadData['sort'] = {
                column_name: event.sortField,
                order: sortOrder,
            };
        }
    }
    getStcHistoryData(payload) {
        this.stcHistoryData = [];
        if (payload !== '') {
            this.sampleTextCatalogService
                .STCHistory('stc-history/get-history', payload)
                .subscribe((res: STCHistory) => {
                    if (res['status'] === 'OK') {
                        if (res['data']) {
                            this.stcHistoryData = res['data'];
                        } else {
                            this.stcHistoryData = [];
                        }
                    }
                });
        }
    }
    columnConfigMenu = [
        {
            label: 'Export',
            icon: 'pi pi-sliders-v',
            command: () => this.objProjectService.exportExcel(this.stcHistoryData, 'Stc_History'),
        },
    ];

    getSTCAttributes() {
        return Object.values(SampleTextAttributes);
    }
}
