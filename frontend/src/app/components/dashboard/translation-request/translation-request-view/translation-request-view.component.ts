import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum, TranslationRequestsStatusEnum, TranslationRequestsStatusIconEnum } from 'src/Enumerations';
import { ImportLanguagesComponent } from 'src/app/components/dashboard/translation-request/translation-request-view/translation-import/dialog/import-languages.component';
import { DashboardLayoutService } from 'src/app/core/services/layoutConfiguration/dashboard-layout.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { AssignProjectManagerComponent } from './assign-project-manager/assign-project-manager.component';
import { TranslationRequestViewModel, initialTranslationRequestViewModel } from './translation-request-view.model';
@Component({
    selector: 'app-translation-request-view',
    templateUrl: './translation-request-view.component.html',
})
export class TranslationRequestViewComponent implements OnInit, OnChanges {
    userInfo;
    visible = true;
    selectedTranslationRequestRow;
    historicFirstPage = 10;
    model: TranslationRequestViewModel = initialTranslationRequestViewModel;
    first = 0;
    rows = 10;
    loading = true;
    @ViewChild('dt') dataTable;
    translationRequestDialogRefrence: DynamicDialogRef;
    translationImportContextMenuItems: MenuItem[];
    translationRequestsStatusEnum = TranslationRequestsStatusEnum;
    translationRequestsStatusIconEnum = TranslationRequestsStatusIconEnum;
    proofreadStatus = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'NO' },
    ];

    @Output() selectProjectTR: EventEmitter<any> = new EventEmitter();
    @Input() documentCount: number;
    constructor(
        private readonly translationRequestService: TranslationRequestService,
        private readonly users: UserService,
        private readonly date: DatePipe,
        private readonly eventBus: NgEventBus,
        private readonly dialogService: DialogService,
        private readonly dashboardLayoutService: DashboardLayoutService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('translationrequest:translationrequest').subscribe(() => {
            this.onload();
        });
    }

    ngOnChanges() {
        if (this.selectedTranslationRequestRow) {
            this.selectedTranslationRequestRow.documentCount = this.documentCount;
            if (this.documentCount === 0) {
                this.selectedTranslationRequestRow['document'] = 'no';
            } else {
                this.selectedTranslationRequestRow['document'] = 'yes';
            }
        }
    }

    loadDataLazy(event: LazyLoadEvent) {
        const start = event.first;
        const end = start + event.rows;
        this.loading = true;
        this.userInfo = this.users.getUser();
        const parameterObject = {
            editor_id: this.userInfo.id,
            start_row: start,
            end_row: end,
        };
        const filArray = [];
        const filterObject = event.filters;
        const entries = Object.entries(filterObject);
        entries.forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    const dataObj = {
                        operator: item.operator,
                        column_name: key,
                        value: key.includes('due_date') ? this.date.transform(item.value, 'yyyy-MM-dd') : item.value,
                        condition: item.matchMode,
                    };
                    if (item.value !== null) filArray.push(dataObj);
                });
            }
        });
        if (filArray.length) {
            parameterObject['filter_data'] = filArray;
        }
        if (event.sortField) {
            const sortOrder = event?.sortOrder === -1 ? 'desc' : 'asc';
            parameterObject['sort'] = { column_name: event.sortField, order: sortOrder };
        }
        this.getTranslationRequestData(parameterObject);
    }

    private onload() {
        this.userInfo = this.users.getUser();
        const parameterObject = {
            editor_id: this.userInfo.id,
            start_row: 0,
            end_row: 10,
        };
        this.getTranslationRequestData(parameterObject);
    }

    onRowClick(row) {
        this.selectedTranslationRequestRow = row;
        this.selectProjectTR.emit(row);
        this.translationImportContextMenuItems = this.getContextMenu(row);
    }

    private getTranslationRequestData(parameterObject) {
        this.translationRequestService
            .getData(parameterObject)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: TranslationRequestViewModel) => {
                if (response) {
                    this.loading = false;
                    this.model = response;
                    this.dashboardLayoutService.setTranslationRequestCount(response.totalTranslationRequest);
                    this.eventBus.cast('translationRequest:totalCount', response);
                    this.onRowClick(this.model.translationRequestsForProject[0]);
                }
            });
    }

    private openTranslationRequestDialog() {
        this.translationRequestDialogRefrence = this.dialogService.open(ImportLanguagesComponent, {
            header: `Languages available for import`,
            footer: ' ',
            modal: true,
            closable: false,
            autoZIndex: true,
            maximizable: false,
            width: '30rem',
            draggable: true,
        });
    }

    getSelectedTranslationRequestForImport(translationRequest) {
        localStorage.setItem('translationOrderData', JSON.stringify(translationRequest));
    }

    private openAssignManagerDialog(row): void {
        const assignManagerDialogRef: DynamicDialogRef = this.dialogService.open(AssignProjectManagerComponent, {
            header: `Assign Project Manager`,
            footer: ' ',
            modal: true,
            autoZIndex: true,
            maximizable: false,
            width: '35rem',
            draggable: true,
        });
        assignManagerDialogRef.onClose.subscribe((response: ApiBaseResponseModel) => {
            if (response.status === ResponseStatusEnum.OK) {
                row.status = TranslationRequestsStatusEnum.New;
            }
        });
    }

    private getContextMenu(row): MenuItem[] {
        return [
            {
                label: 'Import',
                command: () => {
                    this.openTranslationRequestDialog();
                },
            },
            {
                label: 'Assign Project Manager',
                command: () => {
                    this.openAssignManagerDialog(row);
                },
                disabled: row?.status !== TranslationRequestsStatusEnum.Rejected,
            },
        ];
    }
    isColumnProofread(column: string): boolean {
        return column === 'proofread';
    }
    isShowColumnFilter(column: string): boolean {
        return column !== 'proofread' && column !== 'attachments' && column !== 'status';
    }
}
