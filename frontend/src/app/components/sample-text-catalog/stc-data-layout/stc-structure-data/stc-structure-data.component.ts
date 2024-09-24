/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { ConfirmationService, MenuItem, Message, MessageService, TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GroupnodeType, Status, TextnodeType, tableIcons } from 'src/Enumerations';
import { LogService } from 'src/app/core/services/logService/log.service';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';
import { StcActionService } from 'src/app/core/services/sample-text-catalog-service/stc-action.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Brand } from 'src/app/shared/models/brand';
import { StcLanguageConfigurationComponent } from '../../stc-header/stc-language-configuration/stc-language-configuration.component';
import { SampleTextCatalogHistoryRequestModel } from 'src/app/shared/models/sample-text-catalog/stc-history-request.model';

@Component({
    selector: 'app-stc-structure-data',
    templateUrl: './stc-structure-data.component.html',
    styleUrls: ['./stc-structure-data.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class StcStructureDataComponent implements OnInit {
    tableIcons = tableIcons;
    treeData: TreeNode[] = [];
    ref: object;
    cols = [];
    userInfo: object;
    items: MenuItem[];
    selectedNode: TreeNode;
    state;
    subscription: Subscription;
    filterFlag = 0;
    msgs: Message[] = [];
    copiedSampletext;
    @Output() setLayout: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();
    stcByMP = true;
    statusIcon = Status;
    jumpSelectedLangCode: string;
    private isSameBrand = false;
    private isStcAvailable = false;
    private isGroup = false;
    private isStc = false;
    private isIdealtext = false;
    private isRootGroup = false;
    private isTextCopied = false;
    private isShortFrom = false;
    private isCutAction = false;
    private isGroupCreated = false;
    private isSTCCreated = false;

    constructor(
        public sampleTextCatalogService: SampleTextCatalogService,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private eventBus: NgEventBus,
        private objStcActionService: StcActionService,
        private cdr: ChangeDetectorRef,
        private logService: LogService
    ) {
        this.cols = [
            { field: 'context', header: 'Context', type: 'Type' },
            { field: '', header: 'Brand', brand: 'brand_name' },
            { field: 'stc_text', header: 'Sample Text' },
            { field: '', header: 'State', state: 'status' },
        ];
    }

    ngOnInit(): void {
        const url = window.location.href.split('=');
        this.userInfo = this.userService.getUser();
        this.sampleTextCatalogService.getSTCState().subscribe((res) => {
            this.filterFlag = res.filterFlag ?? 0;
            if (this.state?.isGroupAction != 1) {
                this.state = res;
            }

            if (this.filterFlag == 1) {
                this.getStructureDataByTableFilter();
            } else {
                if (this.state.isGroupAction === 1 || this.state?.data?.isGroupAction === 1) {
                    this.state.isGroupAction = 0;
                    if (url.length === 1) {
                        this.onLoad();
                    }
                }
            }
        });
        if (url.length === 1) {
            this.onLoad();
        }

        this.loadContextMenu();
        this.subscription = this.eventBus.on('structure:byStc').subscribe((data: MetaData) => {
            if (data) {
                this.treeData = data.data;
                this.afterJumpOnStcUpdateTree(data);
                this.cdr.markForCheck();
            }
        });
        this.subscription = this.eventBus.on('structure:byStcId').subscribe((data) => {
            if (data) {
                this.getBreadcrumb();
            }
        });
        this.subscription = this.eventBus.on('structure:create').subscribe((data: MetaData) => {
            if (data.data === 'group') {
                this.isGroupCreated = true;
            } else {
                this.isSTCCreated = true;
            }
        });
        this.subscription = this.eventBus.on('structure:delete').subscribe((data: MetaData) => {
            if (data.data === 'group') {
                this.sampleTextCatalogService.getAllParents(
                    this.state.structureSelectedRow,
                    this.treeData,
                    [],
                    'delete'
                );
                this.treeData = [...this.treeData];
            } else {
                this.state.structureSelectedRow.data.stc_text = '';
                if (this.state.structureSelectedRow.data.parent_stc_id !== 0)
                    this.state.structureSelectedRow.data.stc_id = this.state.structureSelectedRow.data.parent_stc_id;
                this.eventBus.cast('structure:create', 'stc');
            }
        });
        this.eventBus.on('stcDataById:stcData').subscribe(() => {
            this.stcByMP = false;
        });
        this.eventBus.on('stcIdByTableData:stcTable').subscribe((data: MetaData) => {
            if (data) {
                this.jumpSelectedLangCode = data.data[0].language_code;
                const payload: SampleTextCatalogHistoryRequestModel = {
                    language_code: this.jumpSelectedLangCode,
                    stc_id: data?.data[0]?.stc_id,
                    super_stc_id: data?.data[0]?.parent_stc_id,
                };
                this.eventBus.cast('stc:history', payload);
            }
        });
    }

    onLoad() {
        const url = `stc-group/getStructure-Stc-data`;
        this.sampleTextCatalogService
            .getStructureDataFromDB(url, {
                brand_id: this.userInfo['brand_id'],
                editor_id: this.userInfo['id'],
            })
            .subscribe((res) => {
                if (res['status'] == 'OK') {
                    if (res['data'].length != 0) {
                        this.sampleTextCatalogService.structuredData = res['data'];
                        if (
                            this.treeData.length > 0 &&
                            (!this.state?.isLanguageChange || this.state?.isLanguageChange === 0) &&
                            this.filterFlag == 0 &&
                            this.treeData.length + 1 >= res['data'].length
                        ) {
                            this.updateTreeData(res['data']);
                        } else {
                            this.treeData = res['data'];
                            this.state.isLanguageChange = 0;
                            this.filterFlag = 0;
                            this.state.filterFlag = 0;
                            this.sampleTextCatalogService.setSTCState(this.state);
                        }
                        this.cdr.markForCheck();
                    }
                }
            });
    }

    loadContextMenu() {
        if (this.stcByMP) {
            this.items = [
                {
                    label: 'Create Group',
                    command: () => {
                        this.createGroup();
                    },
                    disabled: !((this.isGroup && this.isSameBrand) || this.isRootGroup),
                },
                {
                    label: 'Edit Group',
                    command: () => {
                        this.editGroup();
                    },
                    disabled: !(this.isGroup && this.isSameBrand),
                },
                {
                    label: 'Delete Group',
                    command: () => {
                        this.deleteGroup();
                    },
                    disabled: !(this.isGroup && this.isSameBrand),
                },
                { separator: true },
                {
                    label: 'Create Sample Text',
                    command: () => {
                        this.stcCreate();
                    },
                    disabled: !(
                        (this.isGroup && this.isSameBrand) ||
                        (this.isSameBrand && !this.isStcAvailable && this.isStc)
                    ),
                },
                {
                    label: 'Edit Sample Text',
                    command: () => {
                        this.stcEdit();
                    },
                    disabled: !(this.isSameBrand && this.isStcAvailable && this.isStc),
                },
                {
                    label: 'Delete Sample Text',
                    command: () => {
                        this.deleteSampleText();
                    },
                    disabled: !(this.isSameBrand && this.isStcAvailable && this.isStc),
                },
                { separator: true },
                {
                    label: 'Cut',
                    icon: 'pi pi-times',
                    command: (e) => {
                        this.copySampleText(e);
                    },
                    disabled: !(this.isSameBrand && this.isIdealtext),
                },
                {
                    label: 'Copy',
                    icon: 'pi pi-copy',
                    iconStyle: { color: '#304CD9' },
                    command: (e) => {
                        this.copySampleText(e);
                    },
                    disabled: !this.isIdealtext,
                },
                {
                    label: 'Paste',
                    icon: 'pi pi-copy pi-align-center',
                    iconStyle: { color: '#304CD9' },
                    command: () => {
                        this.pasteSampleText();
                    },
                    disabled: !(this.isSameBrand && this.isGroup && this.isTextCopied),
                },
                {
                    label: 'Set State Work In Progress',
                    icon: 'pi pi-circle-fill',
                    iconStyle: { color: '#CD9A23' },
                    command: (e) => {
                        this.changeStatus(e);
                    },
                    disabled: !(this.isContextConditionCheck() && this.sampleTextCatalogService.itsDone),
                },
                {
                    label: 'Set State Done',
                    icon: 'pi pi-circle-fill',
                    iconStyle: { color: '#1EA97C' },
                    command: (e) => {
                        this.changeStatus(e);
                    },
                    disabled: !(this.isContextConditionCheck() && !this.sampleTextCatalogService.itsDone),
                },
            ];
        }
    }

    addGroup() {
        this.state.structureSelectedRow = undefined;
        this.sampleTextCatalogService.setSTCState(this.state);
        this.getSelectedRow();
    }

    createGroup() {
        this.state.treeData = this.treeData;
        const data = { title: 'Create Group', data: this.state, contentId: 'group' };
        this.state.title = 'creategroup';
        this.getBreadcrumb('create');
        this.eventBus.cast('group:create', data);
        this.setLayout.emit(data);
    }

    editGroup() {
        this.state.treeData = this.treeData;
        const data = { title: 'Edit Group', data: this.state, contentId: 'group' };
        this.state.title = 'editgroup';
        this.eventBus.cast('group:edit', data);
        this.setLayout.emit(data);
    }
    detailsGroup() {
        this.state.treeData = this.treeData;
        const data = {
            title: 'Details of Group',
            data: this.state,
            contentId: 'group',
        };
        this.state.title = 'detailsgroup';
        this.eventBus.cast('group:details', data);
        this.setLayout.emit(data);
    }

    stcCreate() {
        const targetLanguage = this.state?.targetLanguage ?? this.state?.data?.targetLanguage;

        if (targetLanguage?.length == 0 || !targetLanguage) {
            this.displayLanguageConfigDialog();
            return;
        }
        const data = {
            title: 'Create Sample Text',
            data: this.state,
            contentId: 'stc',
        };
        this.state.title = 'stccreate';
        this.getBreadcrumb('create');
        this.sampleTextCatalogService.setSTCState(this.state);
        this.eventBus.cast('stc:create', data);
        this.sampleTextCatalogService.hideStausButton = false;
        this.setLayout.emit(data);
    }

    stcEdit() {
        const targetLanguage = !this.state?.targetLanguage
            ? this.state?.data?.targetLanguage
            : this.state?.targetLanguage;

        if (targetLanguage?.length === 0) {
            this.displayLanguageConfigDialog();
            return;
        }
        const data = {
            title: 'Edit Sample Text',
            data: this.state,
            contentId: 'stc',
        };
        this.state.title = 'stcedit';
        this.sampleTextCatalogService.setSTCState(this.state);
        this.eventBus.cast('stc:edit', data);
        this.setLayout.emit(data);
    }

    stcDetails() {
        const data = {
            title: 'Details Of Sample Text',
            data: this.state,
            contentId: 'stc',
        };
        this.state.title = 'stcdetails';
        this.sampleTextCatalogService.setSTCState(this.state);
        this.eventBus.cast('stc:details', data);
        this.sampleTextCatalogService.hideStausButton = true;
        this.setLayout.emit(data);
    }

    selectRow(row) {
        this.getSelectedRow(row);
        if (row?.node.data.Type === 'Group') {
            this.detailsGroup();
        } else if (row?.node.data.Type === 'Stc' || row?.node.data.Type === 'Ideal-text') {
            if (row?.node?.data?.stc_text || row?.node?.data.Type === 'Ideal-text') {
                this.stcDetails();
            } else {
                this.cancel.emit();
            }
        }
    }

    getBreadcrumb(type = '') {
        if (this.state?.breadcrumbItems?.length > 0)
            this.state.breadcrumbItems.splice(0, this.state.breadcrumbItems.length);
        const breadcrumbItems = [];
        if (this.state.structureSelectedRow) {
            const parent = this.state.parent;
            const tillWhere = type === 'create' ? 0 : 2;
            if (parent) {
                parent.map((item, index) => {
                    if (index <= parent.length - tillWhere && item.data.Type === 'Group') {
                        breadcrumbItems.push({ label: item.data.context });
                    }
                });
            }
            this.state.breadcrumbItems = breadcrumbItems;
            this.sampleTextCatalogService.setSTCState(this.state);
        }
    }

    getSelectedRow(e = undefined) {
        this.isSameBrand = false;
        this.isStcAvailable = false;
        this.isGroup = false;
        this.isStc = false;
        this.isIdealtext = false;
        this.isRootGroup = false;
        if (e) {
            this.state.structureSelectedRow = e.node;
            const parent = this.sampleTextCatalogService.getAllParents(e.node, this.treeData);
            if (parent) {
                this.state.parent = parent;
                this.getBreadcrumb();
                if (this.userInfo['brand_id'] === parent[0]?.data.brand_id) {
                    this.isSameBrand = true;
                }
            } else if (e.node?.parent?.data?.brand_id === this.userInfo['brand_id']) {
                this.isSameBrand = true;
            }
            if (e.node.data.Type === 'Stc') {
                this.isStc = true;
                if (!!e.node.data.stc_text && e.node.data.stc_text.length > 0) {
                    this.isStcAvailable = true;
                }
                this.sampleTextCatalogService.selectedSTCRow = e.node;
            }
            if (e.node.data.Type === 'Group') {
                this.isGroup = true;
                this.eventBus.cast('stc:history', '');
            }
            if (e.node.data.Type === 'Ideal-text') {
                this.sampleTextCatalogService.selectedSTCRow = e.node;
                this.isIdealtext = true;
                this.isShortFrom = false;
            }
            if (e.node.data.Type !== 'Group') {
                this.sampleTextCatalogService.itsDone = e.node.data?.status === 'Done' ? true : false;
            }
            if (e.node.data.Type === 'Ideal-text' || e.node.data.Type === 'Stc') {
                this.isShortFrom = e.node.data.Type === 'Stc';
                const payload = {
                    stc_id: e.node.data.stc_id,
                    language_code: !e.node.data.Id ? e.node.data.context : undefined,
                    text: e.node.data.Type ? undefined : e.node.data.stc_text,
                    super_stc_id: e.node.data.stc_id,
                };
                this.eventBus.cast('stc:history', payload);
            } else if (e.node?.data?.stc_text) {
                this.isStc = true;
                this.isShortFrom = true;
                if (e.node.data.stc_text.length > 0) {
                    this.isStcAvailable = true;
                }
                const payload = {
                    stc_id: e.node.parent.data.stc_id,
                    language_code: e.node.parent.data.context,
                    text: e.node.data.stc_text,
                    attribute_id: e.node.data.id,
                };
                this.eventBus.cast('stc:history', payload);
            }
        } else {
            this.isRootGroup = true;
            this.state.structureSelectedRow = undefined;
        }
        this.loadContextMenu();
        this.state.isGroupAction = 0;
        this.sampleTextCatalogService.setSTCState(this.state);
    }

    getBrandLogo(num) {
        return Brand.getBrand(num).getLogo();
        // Refactored: return BrandLogoEnum[num];
    }

    getAltText(num) {
        return Brand.getBrand(num).getName();
        // Refactored: return BrandEnum[num];
    }

    getStatus(state) {
        let num;
        if (state == 'Work in Progress') {
            num = 2;
        }
        return Status[num];
    }

    getNodeIconClassByNodeType(type?: string, nodeType?: string) {
        let iconClass = '';

        if (type === 'Group') {
            iconClass = GroupnodeType.StandardGroup;
        }

        if (nodeType && nodeType in TextnodeType) {
            iconClass = TextnodeType[nodeType];
        }

        return iconClass;
    }
    deleteGroup() {
        const dataBrandId = this.getRowBrandID(this.state.structureSelectedRow);
        if (!!dataBrandId && dataBrandId === this.userInfo['brand_id']) {
            this.confirmationService.confirm({
                message: `Are you sure you want to delete the selected Group "${this.state.structureSelectedRow.data.context}"?`,
                header: 'Delete Group',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.sampleTextCatalogService
                        .deleteSTCGroup(`deletestc/delete_group`, {
                            group_id: this.state.structureSelectedRow.data.Id,
                        })
                        .subscribe({
                            next: (res: any) => {
                                if (res.status === 'OK') {
                                    this.state.isGroupAction = 1;
                                    this.sampleTextCatalogService.getAllParents(
                                        this.state.structureSelectedRow,
                                        this.treeData,
                                        [],
                                        'delete'
                                    );
                                    this.treeData = [...this.treeData];
                                    this.sampleTextCatalogService.setSTCState(this.state);
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: `Selected Group deleted successfully`,
                                    });
                                    setTimeout(() => {
                                        this.cancel.emit();
                                    }, 1000);
                                }
                            },
                            error: () => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: `Error deleting selected Group`,
                                });
                            },
                        });
                },
                reject: () => {
                    this.msgs = [
                        {
                            severity: 'info',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        },
                    ];
                },
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: `You can not delete the selected group!`,
            });
        }
    }

    deleteSampleText() {
        const dataBrandId = this.getRowBrandID(this.state.structureSelectedRow);
        if (!!dataBrandId && dataBrandId === this.userInfo['brand_id']) {
            let message = `Are you sure you want to delete the selected sample text "${this.state.structureSelectedRow.data.stc_text}"?`;
            if (this.state.structureSelectedRow.data?.used_project_count != 0) {
                message = `Are you sure you want to delete the selected sample text  "${this.state.structureSelectedRow.data.stc_text}" as it is being used in other ${this.state.structureSelectedRow.data?.used_project_count} project?`;
            }
            this.confirmationService.confirm({
                message: message,
                header: 'Delete Sample Text',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.sampleTextCatalogService
                        .deleteSTCGroup(`deletestc/delete_sample_text`, {
                            stc_master_id: this.state.structureSelectedRow.data.stc_id,
                        })
                        .subscribe({
                            next: (res: any) => {
                                if (res.status === 'OK') {
                                    this.state.structureSelectedRow.data.stc_text = '';
                                    if (this.state.structureSelectedRow.data.parent_stc_id !== 0)
                                        this.state.structureSelectedRow.data.stc_id =
                                            this.state.structureSelectedRow.data.parent_stc_id;
                                    this.eventBus.cast('structure:create', 'stc');
                                    this.state.isGroupAction = 1;
                                    this.sampleTextCatalogService.setSTCState(this.state);
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: `Selected Sample Text deleted successfully`,
                                    });
                                    setTimeout(() => {
                                        this.cancel.emit();
                                    }, 1000);
                                }
                            },
                            error: () => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: `Error deleting selected Sample Text`,
                                });
                            },
                        });
                },
                reject: () => {
                    this.msgs = [
                        {
                            severity: 'info',
                            summary: 'Rejected',
                            detail: 'You have rejected',
                        },
                    ];
                },
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: `You can not delete the selected sample text!`,
            });
        }
    }

    // Get selected Row brand Id for condition check
    getRowBrandID(rowData): number {
        let brandId: number;
        if (rowData.data.brand_id) {
            brandId = rowData.data.brand_id;
        } else if (rowData.parent) {
            brandId = this.getRowBrandID(rowData.parent);
        }
        return brandId;
    }

    copySampleText(e) {
        if (e.item.label === 'Copy') {
            this.isCutAction = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Sample Text Successfully Copied',
            });
        } else {
            this.isCutAction = true;
        }
        this.isTextCopied = true;
        this.copiedSampletext = this.state.structureSelectedRow;
    }

    pasteSampleText() {
        const dataBrandId = this.getRowBrandID(this.state.structureSelectedRow);
        if (!!dataBrandId && dataBrandId === this.userInfo['brand_id']) {
            const finalData = this.copiedSampletext.children.filter((data) => !!data.data.stc_text);
            if (!this.isCutAction) {
                this.insertPasteData('create', finalData, 0, 0, dataBrandId, this.state.structureSelectedRow.data.Id);
            } else {
                this.insertPasteData(
                    'update',
                    finalData,
                    0,
                    finalData[0].data.parent_stc_id,
                    dataBrandId,
                    this.state.structureSelectedRow.data.Id
                );
            }
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: `You can not paste into other brands`,
            });
        }
    }

    // Display Language Config Dialog
    displayLanguageConfigDialog() {
        this.ref = this.dialogService.open(StcLanguageConfigurationComponent, {
            header: `Language Selection`,
            footer: ' ',
            autoZIndex: false,
            closeOnEscape: false,
        });
    }

    getStructureDataByTableFilter() {
        const url = `stc-table/filter-data`;
        this.sampleTextCatalogService
            .getStructureDataFromDB(url, {
                stc_data: this.state.filterData,
                editor_id: this.userService.getUser().id,
            })
            .subscribe((res) => {
                if (res['status'] == 'OK') {
                    this.filterFlag = 0;
                    this.state.filterFlag = 0;
                    this.sampleTextCatalogService.setSTCState(this.state);
                    if (res['data'].length != 0) {
                        this.treeData = res['data'];
                        this.state.isGroupAction = 0;
                        this.cdr.markForCheck();
                    }
                }
            });
    }

    insertPasteData(action, data, index, parent_stc_id, dataBrandId, groupId) {
        const element = data[index];
        const payload: any = {};
        if (!!element.data.stc_text || element.data.stc_text.length > 0) {
            payload.brand_id = dataBrandId;
            payload.editor_id = this.userInfo['id'];
            payload.language_id = element.data.language_id;
            payload.group_id = groupId;
            payload.ideal_text = element.data.stc_text;
            payload.sequence_order = 1;
            payload.type = element.data.type_id;
            payload.gender = element.data.gender_id || 0;
            payload.numerous = element.data.numerous_id || 0;
            payload.parent_stc_id = parent_stc_id;
            if (action === 'create') {
                payload.short_forms =
                    element.children.length > 0 ? element.children.map((shortForm) => shortForm.data.stc_text) : [];
                payload.descriptions =
                    element.data?.description?.length > 0
                        ? element.data.description.map((description) => {
                              return {
                                  langauge_id: description.langauge_id,
                                  description: description.description,
                              };
                          })
                        : [];
                this.sampleTextCatalogService
                    .saveSTCDataRequest('stc-master/create-Stc', payload)
                    .subscribe((response) => {
                        if (response) {
                            if (response['status'] === 'OK') {
                                if (index === 0) {
                                    parent_stc_id = response['parent_stc_id'];
                                }
                                if (index < data.length - 1) {
                                    this.insertPasteData('create', data, ++index, parent_stc_id, dataBrandId, groupId);
                                }
                                if (data.length === index + 1) {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Success',
                                        detail: 'Sample Text Successfully Pasted',
                                    });
                                    this.onLoad();
                                    return;
                                }
                            }
                        }
                    });
            } else if (action === 'update') {
                payload.stc_id = element.data.stc_id;
                this.objStcActionService
                    .updateStcDataRequest('stc-master/update-Stc', payload)
                    .subscribe((response) => {
                        if (response) {
                            if (response['status'] === 'OK') {
                                if (index === 0) {
                                    parent_stc_id = element.data.stc_id;
                                }
                                if (index < data.length - 1) {
                                    this.insertPasteData('update', data, ++index, parent_stc_id, dataBrandId, groupId);
                                }
                                if (data.length === index + 1) {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Success',
                                        detail: 'Sample Text Successfully Moved',
                                    });
                                    this.onLoad();
                                    return;
                                }
                            }
                        }
                    });
            } else {
                return;
            }
        }
    }

    rowTrackBy(index: number, row: any) {
        return row.node.data.id || row.node.data.title || row.node.data.parent_stc_id;
    }

    updateTreeData(data) {
        if (this.state.structureSelectedRow) {
            const tempParents = this.sampleTextCatalogService.getAllParents(this.state.structureSelectedRow, data);
            if (this.isGroupCreated) {
                this.state.structureSelectedRow.children.push(
                    tempParents[tempParents.length - 1].children[
                        tempParents[tempParents.length - 1].children.length - 1
                    ]
                );
                this.state.structureSelectedRow.expanded = true;
                this.treeData = [...this.treeData];
                const findSelectedNode = this.sampleTextCatalogService.getAllParents(
                    tempParents[tempParents.length - 1].children[
                        tempParents[tempParents.length - 1].children.length - 1
                    ],
                    this.treeData
                );
                setTimeout(() => {
                    this.selectedNode = findSelectedNode[findSelectedNode.length - 1];
                }, 100);
                this.state.structureSelectedRow = findSelectedNode[findSelectedNode.length - 1];
                this.sampleTextCatalogService.setSTCState(this.state);
                this.detailsGroup();
            } else if (this.isSTCCreated) {
                if (this.state.structureSelectedRow.data.Type === 'Group') {
                    const allChildrenOfIdealText = tempParents[tempParents.length - 1].children.filter(
                        (item) => item.data.Type === 'Ideal-text'
                    );
                    this.state.structureSelectedRow.expanded = true;
                    this.state.structureSelectedRow.children.push({
                        ...allChildrenOfIdealText[allChildrenOfIdealText.length - 1],
                    });
                    this.treeData = [...this.treeData];
                    const findSelectedNode = this.sampleTextCatalogService.getAllParents(
                        allChildrenOfIdealText[allChildrenOfIdealText.length - 1],
                        this.treeData
                    );
                    setTimeout(() => {
                        this.selectedNode = findSelectedNode[findSelectedNode.length - 1];
                    }, 100);
                    this.state.structureSelectedRow = findSelectedNode[findSelectedNode.length - 1];
                    this.sampleTextCatalogService.setSTCState(this.state);
                } else if (this.state.structureSelectedRow.data.Type === 'Ideal-text') {
                    const tempIdealText = this.sampleTextCatalogService.getAllParents(this.copiedSampletext, data);
                    this.state.structureSelectedRow.children.push({
                        ...tempIdealText[tempIdealText.length - 1],
                    });
                    this.treeData = [...this.treeData];
                } else {
                    if (
                        this.state.structureSelectedRow.data?.['stc_text'] &&
                        this.state.structureSelectedRow.data.stc_text.length > 0
                    ) {
                        delete this.state.structureSelectedRow['children'];
                        Object.assign(this.state.structureSelectedRow, tempParents[tempParents.length - 1]);
                        Object.assign(this.state.structureSelectedRow.parent, tempParents[tempParents.length - 2]);
                    } else {
                        const tempNewIdealTextParents = this.sampleTextCatalogService.getAllForBlankStcParents(
                            this.state.structureSelectedRow,
                            data
                        );
                        if (!tempNewIdealTextParents) {
                            const isSTCExist = this.state.structureSelectedRow.parent.children.findIndex(
                                (item) => !!item.data?.['stc_text']
                            );
                            if (isSTCExist < 0) {
                                this.sampleTextCatalogService.getAllParents(
                                    this.state.structureSelectedRow.parent,
                                    this.treeData,
                                    [],
                                    'delete'
                                );
                            } else {
                                delete this.state.structureSelectedRow['children'];
                            }
                        } else {
                            if (
                                !tempNewIdealTextParents[tempNewIdealTextParents.length - 1]?.['children'] ||
                                tempNewIdealTextParents[tempNewIdealTextParents.length - 1].children.length <= 0
                            ) {
                                for (const prop in this.state.structureSelectedRow) {
                                    delete this.state.structureSelectedRow[prop];
                                }
                            }
                            Object.assign(
                                this.state.structureSelectedRow,
                                tempNewIdealTextParents[tempNewIdealTextParents.length - 1]
                            );
                        }
                    }
                    this.treeData = [...this.treeData];
                }
            } else if (tempParents) {
                if (this.isCutAction) {
                    this.sampleTextCatalogService.getAllParents(this.copiedSampletext, this.treeData, [], 'delete');
                }
                Object.assign(this.state.structureSelectedRow, tempParents[tempParents.length - 1]);
                this.treeData = [...this.treeData];
            }
        } else if (this.isGroupCreated && !this.state.structureSelectedRow) {
            this.treeData.push({
                ...data.find(
                    (groupItem) =>
                        this.treeData.findIndex((existItem) => existItem.data.context === groupItem.data.context) === -1
                ),
            });
            this.treeData = [...this.treeData];
            setTimeout(() => {
                this.selectedNode = this.treeData[this.treeData.length - 1];
            }, 100);
            this.state.structureSelectedRow = this.treeData[this.treeData.length - 1];
            this.sampleTextCatalogService.setSTCState(this.state);
            this.detailsGroup();
        }
        this.isGroupCreated = false;
        this.isSTCCreated = false;
    }

    changeStatus(rowData) {
        const status = rowData?.item?.label === 'Set State Work In Progress' ? 1 : 2;
        this.sampleTextCatalogService.selectedIdealTextShortFromData = this.selectedNode?.data;
        this.sampleTextCatalogService?.changeStatus(status, this.messageService, 'byRow');
    }

    expandChildren(node: TreeNode) {
        if (node.children) {
            node.expanded = true;
            for (const childNode of node.children) {
                this.expandChildren(childNode);
            }
        }
    }

    afterJumpOnStcUpdateTree(data) {
        this.expandChildren(this.treeData[0]);
        if (this.jumpSelectedLangCode) {
            const selectedRowAfterJump = this.treeData[0].children[0].children.find(
                (item) => item.data.context === this.jumpSelectedLangCode
            );
            if (selectedRowAfterJump) {
                this.selectedNode = selectedRowAfterJump;
                this.state.structureSelectedRow = this.treeData[0];
                if (data?.data[0]?.data.Type === 'Group') {
                    const breadcrumbItems = [];
                    breadcrumbItems.push({ label: data.data[0].data.context });
                    this.eventBus.cast('stc:stcIdByBreadcums', breadcrumbItems);
                }
            }
        }
    }

    isContextConditionCheck(): boolean {
        return this.isStc && this.isStcAvailable && this.isSameBrand && this.isShortFrom;
    }
}
