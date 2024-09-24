import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { LazyLoadEvent } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ReportService } from 'src/app/core/services/reports/report.service';
import { TranslationImportReportService } from 'src/app/core/services/reports/translation-import-report.service';
import { ProjectHistory } from 'src/app/shared/models/versioning/versioning-history';
import { MassOperation, ResponseStatusEnum } from 'src/Enumerations';

@Component({
    selector: 'app-version-history',
    templateUrl: './version-history.component.html',
})
export class VersionHistoryComponent implements OnInit {
    versionHistoryData: ProjectHistory[] = [];
    projectID: number;
    status;
    filArray = [];
    payloadData;
    projectVersionHistory;
    constructor(
        private projectService: ProjectService,
        private eventBus: NgEventBus,
        public reportService: ReportService,
        private date: DatePipe,
        private translationImportReportService: TranslationImportReportService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('showDetailsHistory:showDetailsHistory').subscribe((response: MetaData) => {
            if (response?.data) {
                this.payloadData = response?.data;
                this.getVersionHistoryData(this.payloadData);
            }
        });
    }

    versionHistoryDataLazy(event: LazyLoadEvent) {
        this.versionHistoryData = [];
        this.processFilters(event?.filters);
        this.checkSortedOrder(event);
        this.getVersionHistoryData(this.payloadData);
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

    getVersionHistoryData(payloadData) {
        this.versionHistoryData = [];
        const payload = {
            project_id: payloadData?.pid,
            version_id: payloadData?.version_no,
            filter: payloadData?.filter,
            sort: payloadData?.sort,
        };
        this.projectService
            .versionHistory('project-history', payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: any) => {
                if (response?.status === ResponseStatusEnum.OK) {
                    this.versionHistoryData = response?.data;
                }
            });
    }
    columnConfigMenu = [
        {
            label: 'Export',
            icon: 'pi pi-sliders-v',
            command: () => this.projectService.exportExcel(this.versionHistoryData, 'Project_Version_History'),
        },
    ];

    checkReportType(rowData: ProjectHistory) {
        return (
            rowData.mass_operation_type !== 'Project Properties Update' &&
            rowData.mass_operation_type !== 'Translation Request' &&
            rowData.mass_operation_type !== 'Project Export' &&
            rowData.mass_operation_type !== 'Review Request' &&
            !!rowData.mass_operation_type
        );
    }
    downloadReport(rowData: ProjectHistory) {
        if (rowData.mass_operation_type.toLocaleLowerCase() === 'mapping assistent') {
            this.reportService.saveReport('mapping assistent', undefined, rowData.project_id);
        } else if (rowData.mass_operation_type.toLocaleLowerCase().startsWith('translation import')) {
            this.translationImportReportService.getTranslationImportReport(rowData.project_id).subscribe();
        } else {
            this.reportService.saveReport(rowData.mass_operation_type, undefined, rowData.project_id);
        }
    }

    getMassOperation() {
        return Object.values(MassOperation);
    }
}
