/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */
import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import {
    IgcDockManagerLayout,
    IgcDockManagerPaneType,
    IgcSplitPaneOrientation,
} from '@infragistics/igniteui-dockmanager';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';
@Injectable({
    providedIn: 'root',
})
export class SampleTextCatalogService {
    stateData;
    stcDatalist = [];
    stcHistoryDatalist = [];
    userInfo: object;
    private subject = new BehaviorSubject<any>({});
    structuredData;
    selectedIdealTextShortFromData;
    selectedSTCRow;
    itsDone: boolean;
    hideStausButton = false;
    activeIdealTextTabIndex = 1;
    constructor(private api: ApiService, private userService: UserService) {
        this.userInfo = this.userService.getUser();
    }
    getSTCLanguages(url) {
        return this.api.getTypeRequest(url, '');
    }

    // set STC state
    setSTCState(data) {
        this.userInfo = this.userService.getUser();
        this.stateData = data;
        this.subject.next(data);
    }
    // share STC data between components
    getSTCState() {
        return this.subject.asObservable();
    }

    //save Language Config
    saveLanguageConfig(url) {
        const selectedLanguages = [];
        let preference;
        const targetLanguages = this.stateData?.targetLanguage;
        if (targetLanguages) {
            targetLanguages.map((item, index) => {
                if (index == 0) {
                    preference = 1;
                } else {
                    preference = 0;
                }
                selectedLanguages.push({
                    language_id: item.language_id,
                    preference: preference,
                });
            });
        }

        const data = {
            brand_id: this.userInfo?.['brand_id'],
            languages: selectedLanguages ? selectedLanguages : [],
            created_by: this.userInfo?.['id'],
            editor_id: this.userInfo?.['id'],
        };
        return this.api.postTypeRequest(url, data);
    }

    // get previous configuration
    getSelectedLanguages(url) {
        const data = {
            brand_id: this.userInfo?.['brand_id'],
            editor_id: this.userInfo?.['id'],
        };
        return this.api.postTypeRequest(url, data);
    }

    // Get tree table data
    getStructureDataFromDB(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    getlayout() {
        const defaultLayout: IgcDockManagerLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 100,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.documentHost,
                                size: 100,
                                rootPane: {
                                    type: IgcDockManagerPaneType.splitPane,
                                    orientation: IgcSplitPaneOrientation.horizontal,
                                    panes: [
                                        {
                                            type: IgcDockManagerPaneType.tabGroupPane,
                                            panes: [
                                                {
                                                    type: IgcDockManagerPaneType.contentPane,
                                                    id: 'tab1Stru',
                                                    header: 'Structure',
                                                    contentId: 'structure',
                                                },
                                                {
                                                    type: IgcDockManagerPaneType.contentPane,
                                                    header: 'Table',
                                                    contentId: 'table',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 100,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: '',
                                        contentId: 'group',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: 'Edit Group',
                                        contentId: 'editgroup',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: 'Details of Group',
                                        contentId: 'detailsgroup',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: 'Create Sample Text',
                                        contentId: 'stc',
                                        hidden: true,
                                    },
                                ],
                            },
                            {
                                type: IgcDockManagerPaneType.splitPane,
                                orientation: IgcSplitPaneOrientation.vertical,
                                size: 200,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.documentHost,
                                        size: 200,
                                        rootPane: {
                                            type: IgcDockManagerPaneType.splitPane,
                                            orientation: IgcSplitPaneOrientation.horizontal,
                                            allowEmpty: true,
                                            panes: [
                                                {
                                                    type: IgcDockManagerPaneType.tabGroupPane,
                                                    panes: [
                                                        {
                                                            type: IgcDockManagerPaneType.contentPane,
                                                            documentOnly: true,
                                                            allowClose: false,
                                                            header: 'STC History',
                                                            contentId: 'stcHistory',
                                                            hidden: false,
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return defaultLayout;
    }
    setLayoutOnChange(title, layout, contentId) {
        layout.rootPane.panes[1].panes[0].panes.map((e) => {
            e.hidden = true;
            if (e.contentId !== contentId) {
                e.hidden = true;
            } else {
                e.header = title;
                e.hidden = false;
            }
        });
        return layout;
    }
    createGroup(data) {
        const url = `stc-group/create-group`;
        return this.api.postTypeRequest(url, data);
    }

    editGroup(data) {
        const url = `stc-group/edit-group`;
        return this.api.patchTypeRequest(url, data);
    }

    // Save STC data to DB
    saveSTCDataRequest(url, data) {
        return this.api.postTypeRequest(url, data);
    }

    STCTable(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    getStcTableData(data: any[]): Observable<any[]> {
        this.stcDatalist = [];
        data.forEach((element) => {
            const obj = {
                sequence_no: element.sequence_no,
                brand_name: element.brand_name,
                path: element.path,
                type_val: element.type_val,
                ideal_text: element.ideal_text,
                short_form: element.short_form,
                gender_val: element.gender_val,
                numerous_val: element.numerous_val,
                description: element.description,
                group_id: element.group_id,
                group_name: element.group_name,
                parent_group_id: element.parent_group_id,
                sequence_order: element.sequence_order,
                brand_id: element.brand_id,
                language_code: element.language_code,
                stc_id: element.stc_id,
                language_id: element.language_id,
                type: element.type,
                numerous: element.numerous,
                gender: element.gender,
                parent_stc_id: element.parent_stc_id,
                mapped: element.mapped,
            };
            this.stcDatalist.push(obj);
        });
        return of(this.stcDatalist);
    }

    deleteSTCGroup(url, data) {
        return this.api.deleteTypeRequest(url, data);
    }

    getAllParents(target, children, ancestor = [], action = 'find') {
        if (children?.length > 0) {
            for (const node of children) {
                if (this.isNodeMatch(target, node)) {
                    if (action === 'delete') {
                        children.splice(
                            children.findIndex((item) => item === node),
                            1
                        );
                    }
                    return ancestor.concat(node);
                }
                const foundNode = this.getAllParents(target, node.children, ancestor.concat(node), action);
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    getAllForBlankStcParents(target, children, ancestor = []) {
        if (children?.length > 0) {
            for (const node of children) {
                if (this.isSampleTextCatalogNodeMatch(target, node)) {
                    return ancestor.concat(node);
                }
                const foundNode = this.getAllForBlankStcParents(target, node.children, ancestor.concat(node));
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }

    cancelLayout(layout) {
        layout.rootPane.panes[1].panes[0].panes.map((e) => {
            e.hidden = true;
        });
        return layout;
    }
    getStcData(stcId, children, ancestor = []) {
        if (children?.length > 0) {
            for (const node of children) {
                if (node.data.Type === 'Stc' && node?.data?.stc_id === parseInt(stcId) && node?.data?.type_id > 0) {
                    return ancestor.concat(node);
                }
                const foundNode = this.getStcData(stcId, node.children, ancestor.concat(node));
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    externalProjectReference(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    STCHistory(url, data) {
        return this.api.postTypeRequest(url, data);
    }
    afterRemoveIdealTextAndDescSelectedChange(rows) {
        rows.map((item) => (item.selected = false));
        rows[rows.length - 1].selected = true;
    }
    changeTheStatus(rowData, status) {
        const payload = {};
        payload['editor_id'] = this.userInfo?.['id'];
        payload['brand_id'] = this.userInfo?.['brand_id'];

        if (rowData.header === 'Ideal Text') {
            payload['stc_id'] = rowData.id;
            payload['stc_status'] = status;
            payload['short_form_id'] = null;
            payload['short_form_status'] = null;
        } else {
            payload['stc_id'] = this.getIdelTextTabList.value?.find((item) => item.header === 'Ideal Text')?.id;
            payload['stc_status'] = null;
            payload['short_form_id'] = rowData.id;
            payload['short_form_status'] = status;
        }

        const url = `stc-master/update-status`;
        return this.api.patchTypeRequest(url, payload);
    }
    changeStatus(status, messageService, sourceType) {
        if (sourceType === 'byStcFrom') {
            this.changeStatusByStcFrom(status, messageService, sourceType);
        } else {
            const rowData: any = {
                id: this.selectedIdealTextShortFromData.stc_id
                    ? this.selectedIdealTextShortFromData.stc_id
                    : this.selectedIdealTextShortFromData.id,
                header: this.selectedIdealTextShortFromData.stc_id ? 'Ideal Text' : 'shortFrom',
            };
            this.changeTheStatus(rowData, status).subscribe((res: any) => {
                if (res) {
                    if (res.status.toLowerCase() === 'ok') {
                        this.selectedIdealTextShortFromData.status = this.getStatus(status);
                        this.itsDone = this.selectedIdealTextShortFromData.status === 'Done';
                        this.afterSetStatusRowUpdate(status, this.selectedIdealTextShortFromData, sourceType);
                        messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message,
                        });
                    }
                }
            });
        }
    }
    afterSetStatusRowUpdate(status, selectedData, sourceType) {
        if (sourceType === 'byStcFrom') {
            this.updateStatusForByStcFrom(status, selectedData);
        } else {
            selectedData.status = this.getStatus(status);
            if (this.getIdelTextTabList?.value?.length > 0) {
                const selectedSTCID = selectedData.id ?? selectedData.stc_id;
                if (selectedData) {
                    this.afterAddChangeSelectedIndex();
                    const selectedRowOfStatus = this.getIdelTextTabList.value.find((item) => item.id === selectedSTCID);
                    if (selectedRowOfStatus) {
                        selectedRowOfStatus.status = this.getStatus(status);
                        selectedRowOfStatus.selected = true;
                        this.activeIdealTextTabIndex = this.getIdelTextTabList.value.findIndex(
                            (item) => item.id === selectedSTCID
                        );
                    }
                }
            }
        }
    }

    public get getIdelTextTabList() {
        return this.idealTextFG.get('idealTextRow') as UntypedFormArray;
    }
    idealTextFG: UntypedFormGroup;
    public afterAddChangeSelectedIndex() {
        this.getIdelTextTabList.value?.map((item) => (item.selected = false));
    }

    private isNodeMatch(target, node) {
        return (
            ((target.data?.Id === node.data?.Id && node.data.Type === 'Group') ||
                (target.data?.stc_id === node.data?.stc_id &&
                    target.data?.context === node.data?.context &&
                    node.data.Type === 'Stc') ||
                (target.data?.Id === node.data?.Id && node.data.Type === 'Ideal-text')) &&
            target.data.Type === node.data.Type
        );
    }
    private isSampleTextCatalogNodeMatch(target, node) {
        return (
            target.data?.super_stc_id === node.data?.super_stc_id &&
            target.data?.context === node.data?.context &&
            target.data.Type === 'Stc'
        );
    }
    private getStatus(status: number) {
        return status === 1 ? 'Work in progress' : 'Done';
    }
    private updateStatusForByStcFrom(status, selectedData) {
        const selectedStc = this?.selectedSTCRow?.children.find((item) => item.data.stc_id === selectedData.stc_id);
        if (selectedStc) {
            const shortFormData = selectedStc.children.find((itemSF) => itemSF.data.id === selectedData.id);
            if (shortFormData) {
                shortFormData.data.status = this.getStatus(status);
            } else {
                selectedStc.data.status = this.getStatus(status);
            }
        } else {
            const stcShortFromData = this?.selectedSTCRow?.children.find((item) => item.data.id === selectedData.id);
            if (stcShortFromData) {
                stcShortFromData.data.status = this.getStatus(status);
            } else if (this?.selectedSTCRow?.data.stc_id === selectedData?.stc_id) {
                this.selectedSTCRow.data.status = this.getStatus(status);
            }
        }
    }
    private changeStatusByStcFrom(status, messageService, sourceType) {
        const selectedData = this.selectedIdealTextShortFromData;
        if (selectedData) {
            this.changeTheStatus(selectedData, status).subscribe((res: any) => {
                if (res) {
                    if (res.status.toLowerCase() === 'ok') {
                        this.selectedIdealTextShortFromData.status = this.getStatus(status);
                        this.itsDone = this.selectedIdealTextShortFromData.status === 'Done';
                        this.afterSetStatusRowUpdate(status, selectedData, sourceType);
                        messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res.message,
                        });
                    }
                }
            });
        }
    }
}
