/* eslint-disable sonarjs/elseif-without-else */
/* eslint-disable sonarjs/no-all-duplicated-branches */
/* eslint-disable  @typescript-eslint/no-explicit-any */
//TODO add switch-case statement instated of multiple if else
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as FileSaver from 'file-saver';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { BehaviorSubject, Subject, catchError, of, takeUntil } from 'rxjs';
import {
    Mapped,
    NavigationTypes,
    Roles,
    Status,
    TableActionValue,
    TextNodeStatus,
    TextState,
    TextType,
    TextnodeType,
    TranslationStatus,
    TranslationStatusEnum,
    Type,
    tableIcons,
    tableStatus,
} from 'src/Enumerations';
import { ColumnConfigPopupComponent } from 'src/app/core/dynamic-popups/translation/table/column-configuration/column-config/column-config-popup.component';
import { GridService } from 'src/app/core/services/grid/grid.service';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { TableService } from 'src/app/core/services/project/project-translation/table.service';
import { TextNodePropertiesService } from 'src/app/core/services/project/project-translation/text-node-properties.service';
import { TranslateDataService } from 'src/app/core/services/translatedata/translate-data.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { DropDownModel } from 'src/app/shared/models/translation-manager';
import { ReviewTypes } from '../review-types';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
    selector: 'app-table-view',
    templateUrl: './table-view.component.html',
    styleUrls: ['./table-view.component.scss'],
    providers: [DialogService, TableService],
})
export class TableViewComponent implements OnInit, OnDestroy {
    projectProperties: object;
    selectedTableRow;
    projtranslationIndexectTabelColumns = [];
    projectTableData = [];
    tableActionItems = [];
    projectTabelColumns = [];
    rowIndex = 0;
    languageProperties = [];
    tableIcons = tableIcons;
    colorStatus = Status;
    textNodeType = TextnodeType;
    tableStatus = tableStatus;
    translateLanguages = [];
    columnConfigMenu: MenuItem[];
    @Input() totalTextNode: number;
    role: string = this.projectTranslationService.getProjectParameters()?.['role'];
    ifSelectLang: string;
    selectedHeader;
    existingLayouts = [];
    setLayoutName;
    tblLoading = true;
    selectedLayout: {
        data: string;
        default_layout_selection: boolean;
        layout_name: string;
        project_id: string;
    } = null;
    totalrows = 20;
    lazyLoadChecker = new BehaviorSubject<boolean>(false);
    selectedTreeDBTextId = 0;
    scrollableDiv: HTMLElement;
    @ViewChild('dataTable') table: Table;
    virtualData = [];
    navigateClicked = false;
    startRowhistory = 0;
    start = 0;
    filteredData = [];
    firstTextNode;
    toLastClicked = false;
    destroyed$ = new Subject<boolean>();
    propertyWindowsUpdateSubscription = null;
    private userId: number;
    private editorLangForDone: string;
    private selectedTabelRow;
    filterApplied = false;
    scrolledToTop = false;
    offset = 0;
    appliedFilter = {};
    oldValue = 0;
    textnodeStatus = TextNodeStatus;
    proofreadStatus;
    stateStatus;
    statusNotAvailable: string;
    dynamicFilterOptions = [];
    projectId: number;
    isContextMenuVisible: boolean;
    constructor(
        private eventBus: NgEventBus,
        private projectTranslationService: ProjectTranslationService,
        public objTabelService: TableService,
        private user: UserService,
        private translateDataService: TranslateDataService,
        private dialogService: DialogService,
        private textNodePropertiesService: TextNodePropertiesService,
        private mappingService: MappingService,
        private gridService: GridService
    ) {}

    ngOnInit(): void {
        this.proofreadStatus = [2, 3, 4];
        this.stateStatus = this.gridService.getFilterFromNumericEnum(TranslationStatusEnum);
        this.userId = this.user.getUser().id;
        this.statusNotAvailable = this.projectTranslationService.statusNotAvailable;
        this.projectId = this.projectTranslationService.getProjectParameters()?.projectId;
        //if placeholder changes reload property view
        this.propertyWindowsUpdateSubscription = this.eventBus
            .on('properties-window:update')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: async () => {
                    this.updatePropertiesWindow();
                },
            });

        this.eventBus.on('projectData:selectedProject').subscribe((res: MetaData) => {
            localStorage.setItem('selectedProject', JSON.stringify(res?.data));
        });
        this.projectProperties = JSON.parse(localStorage.getItem('selectedProject'));

        this.eventBus.on('translate:textareaValue').subscribe({
            next: (res: MetaData) => {
                if (this.projectTranslationService.translationSourceType === 'Table')
                    this.bindTranslationText(res?.data);
            },
        });
        this.eventBus
            .on('table:navigation')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (data: MetaData) => {
                    this.navigateClicked = true;
                    this.toLastClicked = false;
                    const totalRow = this.getTotalRowCount();
                    const { 0: first, 9: tenthRow } = this.virtualData;
                    if (data.data.action === 'next' && !data.data.filterBy) {
                        if (this.projectTableData[this.rowIndex + 1]) {
                            this.moveToNextOrPriviousNode(
                                this.rowIndex >= 0 && totalRow > this.rowIndex ? this.rowIndex + 1 : 0
                            );
                        } else {
                            if (totalRow !== this.virtualData.length) {
                                this.moveToNextOrPriviousNode(
                                    this.rowIndex >= 0 && totalRow > this.rowIndex ? this.rowIndex + 1 : 0
                                );
                            } else {
                                this.moveToNextOrPriviousNode(
                                    this.rowIndex + 1 === this.virtualData.length ? 0 : totalRow - 1
                                );
                            }
                        }
                    } else if (data.data.action === 'previous' && !data.data.filterBy) {
                        if (
                            this.scrollableDiv.scrollTop === 0 &&
                            this.virtualData.filter(
                                (elem) => elem?.db_text_node_id === this.firstTextNode?.db_text_node_id
                            ).length <= 0 &&
                            first?.db_text_node_id === this.selectedTableRow[0]?.db_text_node_id
                        ) {
                            this.callPreviousTableData(tenthRow?.db_text_node_id).then(() => {
                                const index =
                                    this.virtualData.findIndex(
                                        (ele) => ele?.db_text_node_id === first?.db_text_node_id
                                    ) - 1;
                                this.moveToNextOrPriviousNode(index >= 0 ? index : 0);
                                this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
                            });
                        } else {
                            this.moveToNextOrPriviousNode(this.rowIndex > 0 ? this.rowIndex - 1 : totalRow - 1);
                            this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
                        }
                    } else if (data.data.action === 'next' && this.checkFilterAction(data)) {
                        this.callNextUnfinished();
                    } else if (data.data.action === 'previous' && this.checkFilterAction(data)) {
                        this.callPreviousUnfinished();
                    } else if (data.data.action === 'tolast') {
                        this.toLastClicked = true;
                        if (totalRow >= TableActionValue.maxRows && this.totalTextNode > TableActionValue.maxRows) {
                            const payload = this.payloadGenerator(
                                0,
                                TableActionValue.maxRows,
                                TableActionValue.previous
                            );
                            this.callTabelFormatApi(payload, 'onLazy').then(() => {
                                this.movetoLast(totalRow);
                            });
                        } else {
                            this.movetoLast(totalRow);
                        }
                    } else if (data.data.action === 'tofirst') {
                        const payload = this.payloadGenerator(0, TableActionValue.maxRows, TableActionValue.next);
                        if (
                            totalRow <= TableActionValue.maxRows &&
                            this.virtualData.filter(
                                (elem) => elem?.db_text_node_id === this.firstTextNode?.db_text_node_id
                            ).length > 0
                        ) {
                            this.moveToNextOrPriviousNode(0);
                            this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
                        } else {
                            this.callTabelFormatApi(payload, 'onLazy').then(() => {
                                this.toLastClicked = !this.toLastClicked;
                                this.moveToNextOrPriviousNode(0);
                                this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
                            });
                        }
                    }
                },
            });
        this.eventBus.on('structure:textnodeupdate').subscribe({
            next: (res: MetaData) => {
                if (res.data.status === 'OK') {
                    this.getRowOnClick(this.selectedTabelRow, this.rowIndex, this.selectedHeader);
                    this.tableTraversal();
                }
            },
        });
        this.eventBus
            .on('translateData:onTableSelect')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    if (this.virtualData.length === 0) {
                        this.virtualData = Array.from({ length: this.totalTextNode });
                        // First time calling API to initialise table data
                        if (this.totalTextNode <= TableActionValue.maxRows) {
                            this.callApi();
                        } else {
                            const payload = this.payloadGenerator(0, TableActionValue.maxRows, TableActionValue.next);
                            this.callTabelFormatApi(payload, 'onLazy', { rows: 0, first: TableActionValue.maxRows });
                        }
                    } else {
                        // initialise this as false if navigation is not clicked
                        const selectedRowDBIndex =
                            this.projectTranslationService.selectedRow['data']?.db_text_node_id ??
                            this.projectTranslationService.selectedRow['db_text_node_id'];
                        const payload = this.payloadGenerator(
                            selectedRowDBIndex,
                            TableActionValue.maxRows,
                            TableActionValue.middle
                        );
                        if (
                            (!!selectedRowDBIndex &&
                                this.virtualData.filter((elem) => elem?.db_text_node_id === selectedRowDBIndex)
                                    .length <= 0) ||
                            (!!selectedRowDBIndex && this.projectTranslationService.textNodeSaved)
                        ) {
                            this.callTabelFormatApi(payload, 'onLazy');
                            this.projectTranslationService.textNodeSaved = false;
                        }
                        this.navigateClicked = false;
                        this.tableTraversal();
                    }
                    this.initialiseTableScroll();
                },
            });
        this.eventBus.on('afterSaveConfigUpdate').subscribe((res: MetaData) => {
            if (res.data) {
                setTimeout(() => {
                    res.data.close();
                }, 2000);
            }
        });
    }

    getTotalRowCount(): number {
        const copyVirtualData = [...this.virtualData];
        return copyVirtualData.reduce((counter, data) => {
            if (typeof data !== 'undefined') counter += 1;
            return counter;
        }, 0);
    }
    initialiseTableScroll() {
        this.scrollableDiv = document.querySelector('div.p-datatable-wrapper');
        this.scrollableDiv.addEventListener('scroll', () => {
            if (this.isScrollBarReachedTop()) {
                this.scrolledToTop = false;
            }
            this.oldValue = this.scrollableDiv.scrollTop;
            const { 10: first, [this.virtualData.length - 10]: lastTen } = this.virtualData;
            if (this.isScrollBarReachedBottom()) {
                const totalrows = this.getTotalRowCount();
                if (this.virtualData.length === TableActionValue.maxRows && !!lastTen) {
                    this.callNextTableData(lastTen?.db_text_node_id, totalrows).then(() => {
                        this.scrolledToTop = true;
                    });
                }
            } else if (this.isScrollbarReachedTopAfterReachedBottom()) {
                this.callPreviousTableData(first?.db_text_node_id);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.propertyWindowsUpdateSubscription.unsubscribe();
        this.virtualData = [];
    }

    onFilterApplied(event) {
        if (event?.['filteredValue']) {
            this.filteredData = event.filteredValue;
        }
    }

    loadTableDataLazy(event: LazyLoadEvent) {
        const direction = event?.sortOrder < 0 ? TableActionValue.previous : TableActionValue.next;
        const payload = this.payloadGenerator(0, TableActionValue.maxRows, direction);
        if (Object.entries(event?.filters)?.length > 0) {
            this.objTabelService.getTabelFilterObject(event).subscribe((filterObject: any) => {
                if (event.sortField) {
                    payload['sort'] = this.objTabelService.getSortObject(event);
                    payload['direction'] = TableActionValue.next;
                }
                if (filterObject?.length > 0) {
                    this.projectTranslationService.filterAppliedInStructure = true;
                    this.filterApplied = true;
                    payload['filter'] = filterObject;
                    if (filterObject[filterObject.length - 1]?.language_code) {
                        payload['language_code'] = filterObject[filterObject.length - 1].language_code;
                    }

                    this.appliedFilter = payload;
                    this.callTabelFormatApi(payload, 'onLazy', event);
                    this.eventBus.cast('translateData:afterOnTableFilter', payload);
                } else if (filterObject?.length <= 0 && this.filterApplied) {
                    this.projectTranslationService.filterAppliedInStructure = false;
                    this.projectTranslationService.filterRemovedInTable.next(true);
                    this.filterApplied = false;
                    this.appliedFilter = {};

                    this.callTabelFormatApi(payload, 'onLazy', event);
                } else {
                    if (event.sortField) {
                        this.appliedFilter = payload;
                        this.filterApplied = true;
                        this.projectTranslationService.filterAppliedInStructure = true;
                        this.callTabelFormatApi(payload, 'onLazy', event);
                    } else {
                        this.callTabelFormatApi(payload, 'onLazy', event);
                    }
                }
            });
        } else if (event.sortField) {
            payload['sort'] = this.objTabelService.getSortObject(event);
            payload['end_row'] = this.totalTextNode;
        }
    }

    // clear Filter
    clear(table: Table) {
        table.clear();
    }

    exportDatainExcel() {
        const excellData = [...this.projectTableData];
        const headerAll = Object.keys(excellData[0]);

        const getHeader = [];
        for (const val of this.objTabelService.header.projectTabelColumns) {
            getHeader.push(val.field);
        }
        const notSelectRow = headerAll.filter((e) => !getHeader.includes(e));
        const newReportData = excellData;
        for (const valRow of notSelectRow) {
            for (let i = 0; i < excellData.length; i++) {
                if (Object.prototype.hasOwnProperty.call(newReportData[i], valRow)) {
                    delete newReportData[i][valRow];
                }
            }
        }
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(newReportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.saveAsExcelFile(excelBuffer, 'Translation-Data');
        });
    }

    getRowOnClick(data, header, rowIndex) {
        this.rowIndex = rowIndex;
        this.selectedTabelRow = data;
        this.selectedHeader = header;
        this.ifSelectLang = header && header.langCode !== '' ? header.langCode : this.editorLangForDone;
        const editorLangWiseDataFromAPI = data?.language_data.find((item) => item.language_code === this.ifSelectLang);
        if (editorLangWiseDataFromAPI) {
            const langProps = editorLangWiseDataFromAPI['language_props'];
            const textValue =
                this.projectTranslationService?.selectedRow['data']?.translation ?? this.getPropsValue(langProps);
            const selectedRowForTranslation: any = {
                treeNode: {
                    data: {
                        user: langProps?.find((item) => item.prop_name === 'User')?.value,
                        Type: data?.text_node_type,
                        translation_lastchange: langProps?.find((item) => item.prop_name === 'Last change')?.value,
                        text_node_type: data?.text_node_type,
                    },
                },
                translateObj: {
                    source: data?.source_text,
                    translation: textValue,
                    editorLanguage: this.editorLangForDone,
                    foreginLangCode: this.ifSelectLang,
                    state: langProps?.find((item) => item?.prop_name === 'State').value,
                    lockSatus: langProps?.find((item) => item?.prop_name === 'Locked')?.value,
                },
                type: 'table',
                rowData: data,
                editorLangWiseDataFromAPI: editorLangWiseDataFromAPI,
            };
            this.projectTranslationService.getSelectedRow(data, textValue, 'Table', this.editorLangForDone, header);
            this.eventBus.cast('translateData:translateObj', selectedRowForTranslation);
            const breadcrumb = data.group_path?.map((item) => ({
                label: item?.name,
            }));
            this.eventBus.cast('structure:breadcrumb', breadcrumb);
            this.mappingService.selectedTabelRowDataForMappingProposal = {
                tabelRow: data,
                tabelColumn: header,
                editorLang: this.editorLangForDone,
                editorLangId: editorLangWiseDataFromAPI.language_id,
            };

            this.updatePropertiesWindow();

            this.eventBus.cast('translateData:forSTCDetailsRequiredParameter', {
                tabelRow: data,
                tabelColumn: header,
                editorLang: this.editorLangForDone,
                editorLangId: editorLangWiseDataFromAPI.language_id,
            });
        }
    }

    private getPropsValue(langProps) {
        const value = langProps?.find((item) => item.prop_name === 'Text').value;
        return value !== '_' ? value : '';
    }

    updatePropertiesWindow() {
        if (!this.selectedTabelRow) {
            return;
        }

        const props = this.projectTranslationService.getProjectParameters();
        const editorLangWiseDataFromAPI = this.selectedTabelRow?.language_data.find(
            (item) => item.language_code === this.ifSelectLang
        );

        const payloadObj: any = {
            payload: {
                index: this.selectedTabelRow.array_item_index === '_' ? null : this.selectedTabelRow.array_item_index,
                node_id: this.selectedTabelRow?.text_node_id === '_' ? null : this.selectedTabelRow?.text_node_id,
                parent_stc_id: editorLangWiseDataFromAPI?.parent_stc_id?.toString(),
                project_id: props?.projectId,
                stc_master_id: editorLangWiseDataFromAPI?.stc_master_id?.toString(),
                variant_id: this.selectedTabelRow?.variant_id === '_' ? null : this.selectedTabelRow?.variant_id,
                db_text_node_id:
                    this.selectedTabelRow?.db_text_node_id === '_' ? null : this.selectedTabelRow?.db_text_node_id + '',
                version_id: props?.version,
                language_code: this.editorLangForDone,
            },
        };
        if (
            this.projectTranslationService.getProjectParameters()?.role !== Roles.proofreader &&
            this.projectTranslationService.getProjectParameters()?.role !== Roles.reviewer
        )
            this.textNodePropertiesService.getSelectedRow(payloadObj);
    }

    checkLanguageProperties() {
        return this.languageProperties.find((item) => item.display === true);
    }

    findValue(rowdata, headerProp): any {
        return this.objTabelService?.getTdValue(rowdata, headerProp);
    }

    callApi() {
        if (this.start > this.totalTextNode) {
            return;
        }
        const increaseBy = TableActionValue.maxRows;
        const payload = this.payloadGenerator(this.start, increaseBy, TableActionValue.next);
        this.callTabelFormatApi(payload, 'onLazy', { rows: increaseBy, first: this.start }).then(() => {
            this.start += increaseBy;
            if (this.start < this.totalTextNode) {
                this.callApi();
            }
        });
    }

    async callTabelFormatApi(payload, flag, event?) {
        return new Promise((resolve) => {
            this.tblLoading = true;
            this.lazyLoadChecker.next(false);

            this.projectTranslationService
                .getTranslateTableData(this.getUrlRoleWise(Roles[payload?.role]), payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe({
                    next: (res: any) => {
                        if (res) {
                            if (res?.data?.length > 0) {
                                this.editorLangForDone = res.editorial_lang ?? res.editorLanguage;
                                if (Object.values(this.objTabelService.header).length === 0) {
                                    this.objTabelService.getTabelHeader(res.data[0]);
                                    this.setDefaultLayout();
                                }
                                if (this.projectTableData.length === 0) {
                                    const { 0: first } = res.data;
                                    this.firstTextNode = first;
                                } else if (
                                    this.projectTableData[this.projectTableData.length - 1]?.db_text_node_id ===
                                    res.data[res.data.length - 1]?.db_text_node_id
                                ) {
                                    this.toLastClicked = true;
                                }

                                if (
                                    this.projectTableData.length !== 0 &&
                                    TableActionValue.maxRows > res.data.length &&
                                    payload.direction !== 1
                                ) {
                                    res.data.forEach((ele) => {
                                        if (
                                            !this.projectTableData.some(
                                                (el) => el?.db_text_node_id === ele?.db_text_node_id
                                            )
                                        ) {
                                            this.projectTableData.push(ele);
                                        }
                                    });
                                } else {
                                    this.projectTableData = [...res.data];
                                }
                                // Server side filtering -- STARTS
                                if (event?.['filters']) {
                                    this.virtualData = [...res.data];
                                    this.projectTableData = [...res.data];
                                    // Server side filtering -- ENDS
                                } else {
                                    this.virtualData = [...this.projectTableData];
                                    this.projectTranslationService.tableValue = this.virtualData;
                                }
                                this.tblLoading = false;
                                this.lazyLoadChecker.next(true);
                            } else {
                                this.tblLoading = false;
                                this.projectTableData = [];
                                this.virtualData = [];
                            }
                            resolve({ message: 'fetched data' });
                            this.scrollIfRowExists();
                        }
                    },
                });
        });
    }

    openColConfigPopup() {
        const requestData = this.projectTranslationService.getProjectParameters();
        const ref = this.dialogService.open(ColumnConfigPopupComponent, {
            header: 'Column Configuration',
            closeOnEscape: false,
            closable: false,
            autoZIndex: false,
            data: {
                userId: this.userId,
                projectId: requestData?.projectId,
                selectedLayout: this.selectedLayout,
                selectedColumns: this.objTabelService?.header?.projectTabelColumns?.filter((item) => item.display),
                availableColumns: this.objTabelService?.header?.projectTabelColumns?.filter((item) => !item.display),
                translateLanguages: this.objTabelService?.header?.langList,
            },
        });

        ref.onClose.subscribe((data) => {
            if (data) {
                this.projectTabelColumns = data.selectedColumns;
                this.selectedLayout = data.selectedLayout;
                this.projectTabelColumns = data.availableColumns;
                this.existingLayouts = data.existingLayouts;
            }
        });
    }

    setDefaultLayout() {
        this.translateDataService
            .getTranslateTableLayout(this.userId)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res: any) => {
                if (res) {
                    const layoutData = res.data.find((item) => item.default_layout_selection === true);

                    this.selectedLayout = layoutData;
                    if (layoutData?.data) {
                        const layoutDataUpdated = JSON.parse(layoutData?.data);
                        layoutDataUpdated?.map(
                            (item) => (item['langCode'] = !item['langCode'] ? '' : item['langCode'])
                        );
                        this.objTabelService.conditionWiseHeaderHideShow(
                            layoutDataUpdated,
                            this.objTabelService.header.projectTabelColumns
                        );
                    }
                }
            });
    }

    setShowHideValue() {
        if (this.role !== 'translator') {
            this.columnConfigMenu = [
                {
                    label: 'Show/Hide Columns',
                    icon: 'pi pi-sliders-v',
                    command: () => this.openColConfigPopup(),
                },
            ];
        }
    }

    bindTranslationText(Text) {
        if (this.projectTranslationService.forStatusChangebject) {
            this.projectTranslationService.forStatusChangebject.translation_text = Text;
        }
        const editorLangWiseDataFromAPI = this.selectedTabelRow?.language_data.find(
            (item) => item.language_code === this.ifSelectLang
        );
        if (editorLangWiseDataFromAPI) {
            const selectedlang = this.selectedTabelRow['language_data'].find(
                (item) => item.language_code === this.ifSelectLang
            ).language_props;
            selectedlang.find((item) => item.prop_name === 'Text').value = Text;
            if (Text.length === 0) {
                selectedlang.find((item) => item.prop_name === 'State').value = 'Unworked';
                this.projectTranslationService.state = 'Unworked';
            } else {
                selectedlang.find((item) => item.prop_name === 'State').value = 'Work in progress';
                this.projectTranslationService.state = 'Work in progress';
            }
        }
    }

    getTabelDataRowContextmenu(rowData, col) {
        this.isContextMenuVisible = rowData?.node_type === Type.MetaText;
        this.columnConfigMenu = this.projectTranslationService.getContextMenu(
            rowData,
            'Table',
            undefined,
            col?.langCode
        );
        const selectedLang = col?.langCode === '' ? this.editorLangForDone : col?.langCode;
        const langData = rowData?.language_data.find((item) => item.language_code === selectedLang);
        if (langData) {
            const langPropsData = langData.language_props;
            const doneStatus = langPropsData.find((item) => item.prop_name === 'State').value;
            const lockStatus = langPropsData.find((item) => item.prop_name === 'Locked')?.value;
            this.projectTranslationService.statusWiseContextMenu(lockStatus, doneStatus, this.columnConfigMenu);
        }
    }

    moveToNextOrPriviousNode(rowIndex) {
        this.selectedTableRow = [this.projectTableData[rowIndex]];
        this.getRowOnClick(this.projectTableData[rowIndex], this.selectedHeader, rowIndex);
        this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
    }

    getIndexFinishedAndUnfinishedRow(action, role: number) {
        let unfinfinedIndex = 0;
        let reverseIndex = 1;
        if (action === 'nextUnfinish') {
            for (const project of this.projectTableData) {
                const itemIndex = this.projectTableData.indexOf(project);
                if (this.rowIndex < itemIndex) {
                    const langProps = project.language_data.find(
                        (element) => element.language_code === this.editorLangForDone
                    ).language_props;
                    if (role === Roles.editor) {
                        if (langProps?.find((props) => this.isTextNodeNotDone(props.prop_name, props.value))) {
                            unfinfinedIndex = itemIndex;
                            break;
                        }
                    } else if (role === Roles.translator) {
                        if (
                            langProps?.find((props) => this.isTextNodeNotDone(props.prop_name, props.value)) ||
                            this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Rejected) ||
                            this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Rejected)
                        ) {
                            unfinfinedIndex = itemIndex;
                            break;
                        }
                    } else if (role === Roles.reviewer) {
                        if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Standard)
                            if (
                                this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Pending)
                            ) {
                                unfinfinedIndex = itemIndex;
                                break;
                            }
                        if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Screen)
                            if (
                                this.checkTableNavigationCondition(
                                    langProps,
                                    'ScreenReview Status',
                                    TextNodeStatus.Pending
                                )
                            ) {
                                unfinfinedIndex = itemIndex;
                                break;
                            }
                    } else {
                        if (
                            this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Pending) ||
                            this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Rejected)
                        ) {
                            unfinfinedIndex = itemIndex;
                            break;
                        }
                    }
                }
            }
        } else {
            //TODO Refactoring of this logic needs to be done HMIL-5447
            for (let i = 0; i < this.projectTableData.length; i++) {
                const project =
                    this.projectTableData[
                        this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex
                    ];
                const langProps = project?.language_data.find(
                    (element) => element.language_code === this.editorLangForDone
                ).language_props;

                if (role === Roles.editor) {
                    if (langProps?.find((props) => this.isTextNodeNotDone(props.prop_name, props.value))) {
                        unfinfinedIndex =
                            this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex;
                        break;
                    }
                } else if (role === Roles.translator) {
                    if (
                        langProps?.find((props) => this.isTextNodeNotDone(props.prop_name, props.value)) ||
                        this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Rejected) ||
                        this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Rejected)
                    ) {
                        unfinfinedIndex =
                            this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex;
                        break;
                    }
                } else if (role === Roles.reviewer) {
                    if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Standard)
                        if (this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Pending)) {
                            unfinfinedIndex =
                                this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex;
                            break;
                        }
                    if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Screen)
                        if (this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Pending)) {
                            unfinfinedIndex =
                                this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex;
                            break;
                        }
                } else {
                    if (
                        this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Pending) ||
                        this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Rejected)
                    ) {
                        unfinfinedIndex =
                            this.rowIndex === 0 ? this.projectTableData.length - 1 : this.rowIndex - reverseIndex;
                        break;
                    }
                }
                reverseIndex++;
            }
        }
        return unfinfinedIndex;
    }

    checkTableNavigationCondition(langProps, status: string, action: number): boolean {
        const filteredArray = langProps?.filter((obj) => {
            return obj.prop_name === 'State' || obj.prop_name === status;
        });
        return (
            this.checkProperty(filteredArray, 'State', TranslationStatus.Done) &&
            this.checkProperty(filteredArray, status, action)
        );
    }

    checkProperty(array, propName: string, propValue: string | number): boolean {
        return array?.some((obj) => obj.prop_name === propName && obj.value === propValue);
    }

    filter() {
        this.table.reset();
    }

    payloadGenerator(startRow: number, endRow: number, direction: number) {
        if (startRow < 0) {
            startRow = 0;
        }
        const requestData = this.projectTranslationService.getProjectParameters();

        const payload = {
            project_id: requestData?.projectId,
            version_id: requestData?.version,
            rowId: startRow,
            limit: endRow,
            direction: direction,
            language_code: this.getReviewerSelectedLanguage(requestData),
            translation_request_id: requestData?.['translationRequestId'],
            role: Roles[requestData?.['role']],
        };
        if (requestData?.['role'] === Roles.reviewer) {
            payload['reviewType'] = requestData?.reviewType;
        }
        return payload;
    }

    tableTraversal() {
        if (this.projectTranslationService?.structureSelectedRow) {
            if (this.projectTranslationService.structureSelectedRow?.data?.['TextNodeId']) {
                let index = this.projectTableData.findIndex(
                    (item) =>
                        item?.db_text_node_id ===
                        this.projectTranslationService.structureSelectedRow.data?.db_text_node_id
                );
                if (
                    index === -1 &&
                    this.projectTranslationService.structureSelectedRow.data?.db_text_node_id !==
                        this.selectedTabelRow?.db_text_node_id
                ) {
                    index = this.projectTableData.findIndex(
                        (item) => item?.db_text_node_id === this.selectedTabelRow?.db_text_node_id
                    );
                }
                this.moveToNextOrPriviousNode(index === -1 ? 0 : index);
            } else if (this.projectTranslationService.structureSelectedRow?.data?.['ID']) {
                const parentIndex = this.projectTableData.findIndex(
                    (item) =>
                        item?.db_text_node_id ===
                        this.projectTranslationService.structureSelectedRow.parent.data?.db_text_node_id
                );
                this.moveToNextOrPriviousNode(parentIndex === -1 ? 0 : parentIndex);
            } else {
                this.moveToNextOrPriviousNode(0);
            }
        }
    }
    private movetoLast(totalRow: number) {
        const total = totalRow !== this.virtualData.length ? this.getTotalRowCount() : totalRow;
        this.moveToNextOrPriviousNode(total - 1);
        this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    }
    isStatusButton(col) {
        return (
            col.field !== 'property_name' &&
            col.field !== 'source_text' &&
            col.field !== 'text_type' &&
            !col.field.includes('Proofread Status') &&
            !col.field.includes('Review Status') &&
            !col.field.includes('ScreenReview Status') &&
            !col.field.includes('Labels')
        );
    }

    isColumnSourceTextOrTextType(column: string): boolean {
        return column === 'source_text' || column === 'text_type';
    }

    private isScrollBarReachedTop(): boolean {
        return (
            this.oldValue - this.scrollableDiv.scrollTop < 0 &&
            this.scrollableDiv.scrollTop > Math.round((this.scrollableDiv.scrollHeight / 100) * 5)
        );
    }

    private isScrollBarReachedBottom(): boolean {
        return (
            this.scrollableDiv.scrollTop + this.scrollableDiv.clientHeight >= this.scrollableDiv.scrollHeight &&
            !this.toLastClicked
        );
    }

    private isScrollbarReachedTopAfterReachedBottom(): boolean {
        return (
            this.scrollableDiv.scrollTop === 0 &&
            this.scrollableDiv.scrollLeft <= 0 &&
            this.virtualData.filter((elem) => elem?.db_text_node_id === this.firstTextNode?.db_text_node_id).length <=
                0 &&
            !this.scrolledToTop
        );
    }

    isProofReaderOrReviewerStatus(col): boolean {
        return col.field.includes('Proofread Status') || col.field.includes('Review Status');
    }

    getProofReadOrReviewStatusIcon(field: string): string {
        switch (field) {
            case 'Proofread Status':
                return 'icon-pending';
            case 'Review Status':
                return 'icon-review';
            default:
                return 'icon-pending';
        }
    }

    isStateStatus(col): boolean {
        return col.field.includes('State');
    }

    isCustomFilter(column): boolean {
        return (
            column.field === 'text_type' ||
            column.field === 'Locked' ||
            column.field === 'mapped' ||
            column.field === 'Labels'
        );
    }

    getDynamicOptions(value: string) {
        this.dynamicFilterOptions = this.getDynamicFilterOptions(value);
    }

    getDynamicFilterOptions(value: string): DropDownModel[] {
        switch (value) {
            case 'text_type':
                return this.gridService.getFilterFromStringEnum(TextType);
            case 'Locked':
                return this.gridService.getFilterFromStringEnum(TextState);
            case 'mapped':
                return this.gridService.getFilterFromStringEnum(Mapped);
            default:
                return [];
        }
    }

    isDefaultFilter(column): boolean {
        return !(
            this.isProofReaderOrReviewerStatus(column) ||
            this.isStateStatus(column) ||
            this.isCustomFilter(column)
        );
    }

    private callPreviousTableData(firstNodeId: number) {
        this.toLastClicked = false;
        const payload = this.filterApplied
            ? this.appliedFilter
            : this.payloadGenerator(firstNodeId, TableActionValue.maxRows, TableActionValue.previous);
        if (this.filterApplied && this.offset >= this.projectTableData.length) {
            this.offset -= this.projectTableData.length;
            payload['offset'] = this.projectTableData.length === 0 ? 0 : this.offset;
        }
        return this.callTabelFormatApi(payload, 'onLazy', null);
    }

    getReviewerSelectedLanguage(requestData: any) {
        if (requestData?.role === Roles.editor) {
            return requestData?.editorLanguageCode;
        } else if (requestData?.role === Roles.translator) {
            return requestData?.sourceLangCode;
        } else if (requestData?.role === Roles.proofreader) {
            return requestData?.proofreaderLangCode;
        } else if (requestData?.role === Roles.reviewer) {
            return requestData?.reviewerLangCode;
        }
    }

    getUrlRoleWise(role) {
        let url = `tabular-format`;
        if (role === Roles.reviewer) {
            url = `review/table-data`;
        }
        return url;
    }

    private callNextTableData(lastRowId: number, totalrows: number) {
        const payload = this.filterApplied
            ? this.appliedFilter
            : this.payloadGenerator(lastRowId, TableActionValue.maxRows, TableActionValue.next);
        if (this.filterApplied) {
            this.offset += this.projectTableData.length;
            payload['offset'] = this.projectTableData.length === 0 ? 0 : this.offset;
        }
        return this.callTabelFormatApi(payload, 'onLazy', {
            rows: totalrows + TableActionValue.maxRows,
            first: totalrows,
        });
    }

    private callNextUnfinished() {
        const requestData = this.projectTranslationService.getProjectParameters();
        const index = this.getIndexFinishedAndUnfinishedRow('nextUnfinish', requestData?.['role']);
        const { [this.virtualData.length - 10]: last } = this.virtualData;
        const totalrows = this.getTotalRowCount();
        if (this.isSelectedRowExists(index)) {
            this.callNextTableData(last?.db_text_node_id, totalrows).then(() => {
                const tableData = [...this.projectTableData];
                const filteredTableData = this.getLanguageTextNodeWithStatus(tableData);
                if (filteredTableData) {
                    this.moveToNextOrPriviousNode(this.projectTableData.indexOf(filteredTableData));
                } else {
                    this.callNextUnfinished();
                }
            });
        } else {
            this.moveToNextOrPriviousNode(index);
            this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table');
        }
    }

    private callPreviousUnfinished() {
        const requestData = this.projectTranslationService.getProjectParameters();
        const index = this.getIndexFinishedAndUnfinishedRow('previousUnfinished', requestData?.['role']);
        if (this.isSelectedRowDoneOrFirstRow(index)) {
            this.callPreviousTableData(this.selectedTabelRow?.db_text_node_id).then(() => {
                const tableData = [...this.projectTableData].reverse();
                const filteredTableData = this.getLanguageTextNodeWithStatus(tableData);
                if (filteredTableData) {
                    this.moveToNextOrPriviousNode(this.projectTableData.indexOf(filteredTableData));
                } else {
                    this.callPreviousUnfinished();
                }
            });
        } else {
            this.moveToNextOrPriviousNode(index);
        }
    }

    checkFilterAction(data): boolean {
        return (
            data.data.filterBy === NavigationTypes.Unfinished ||
            data.data.filterBy === NavigationTypes.Proofread ||
            data.data.filterBy === NavigationTypes.Reviewer
        );
    }

    private navigateBasedOnRole(role: number, langProps = []) {
        if (role === Roles.editor) {
            return langProps?.find((props) => this.isTextNodeNotDone(props?.prop_name, props?.value));
        } else if (role === Roles.translator) {
            return (
                langProps?.find((props) => this.isTextNodeNotDone(props?.prop_name, props?.value)) ||
                this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Rejected) ||
                this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Rejected)
            );
        } else if (role === Roles.reviewer) {
            if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Standard)
                return this.checkTableNavigationCondition(langProps, 'Review Status', TextNodeStatus.Pending);
            if (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Screen)
                return this.checkTableNavigationCondition(langProps, 'ScreenReview Status', TextNodeStatus.Pending);
        } else {
            return this.checkTableNavigationCondition(langProps, 'Proofread Status', TextNodeStatus.Pending);
        }
    }

    private getLanguageTextNodeWithStatus(tableData = []) {
        return tableData.find((ele) => {
            return ele.language_data.find(
                (el) =>
                    el.language_code === this.editorLangForDone &&
                    this.navigateBasedOnRole(this.user.getUser().role, el.language_props)
            );
        });
    }

    private isTextNodeNotDone(state: string, value: string | number): boolean {
        return state === 'State' && value !== TranslationStatus.Done && value !== '_';
    }

    private isSelectedRowExists(index): boolean {
        return index <= 0 && !this.toLastClicked;
    }

    private isSelectedTextStateDone(index: number): boolean {
        return TranslationStatus.Done === this.getTableTextState(index);
    }

    private getTableTextState(index: number): string {
        return this.projectTableData[index]?.['language_data']
            ?.find((item) => item.language_code === this.ifSelectLang)
            ?.language_props.find((lang) => lang?.prop_name === 'State').value;
    }

    private isSelectedRowDoneOrFirstRow(index: number): boolean {
        return (
            (this.isSelectedTextStateDone(index) && this.isSelectedRowExists(index)) || this.isSelectedRowFirstNode()
        );
    }

    private isSelectedRowFirstNode(): boolean {
        return this.projectTranslationService.selectedRow['db_text_node_id'] === this.firstTextNode?.db_text_node_id;
    }

    private scrollIfRowExists(): void {
        this.selectedTabelRow
            ? this.projectTranslationService.ScrollToSelectedItem(this.table, 'tr-table')
            : this.tableTraversal();
    }

    isLabels(col): boolean {
        return col.field.includes('Labels');
    }
}
