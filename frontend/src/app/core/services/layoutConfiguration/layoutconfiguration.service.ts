import { Injectable } from '@angular/core';
import {
    IgcDockManagerComponent,
    IgcDockManagerLayout,
    IgcDockManagerPaneType,
    IgcSplitPaneOrientation,
} from 'igniteui-dockmanager';
import { NgEventBus } from 'ng-event-bus';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { Roles } from 'src/Enumerations';
import { ApiService } from '../api.service';
@Injectable({
    providedIn: 'root',
})
export class LayoutconfigurationService {
    mappingStatus = true;
    dockManager: IgcDockManagerComponent;
    savedConfigurations = [];
    isInputDisabled = true;
    layoutConfig;
    layoutName: string;
    selectConfig;
    layoutDialog: DynamicDialogRef;
    translationHeader: string;
    constructor(private api: ApiService, private messageService: MessageService, private eventBus: NgEventBus) {}

    updateIgnitePanelHeader(role) {
        switch (role) {
            case Roles['proofreader']:
                this.translationHeader = `Proofread`;
                break;
            case Roles['reviewer']:
                this.translationHeader = `Review`;
                break;
            default:
                this.translationHeader = `Translation`;
                break;
        }
        this.eventBus.cast('configurationService:ignitePanelHeader', this.translationHeader);
        return this.translationHeader;
    }

    enableInput(event) {
        if (event?.checked.length) {
            this.isInputDisabled = false;
        } else {
            this.isInputDisabled = true;
        }
    }

    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }

    getDocManagerLayout() {
        this.dockManager = document.getElementById('dockManager') as IgcDockManagerComponent;
        this.dockManager.layout = this.defaultLayoutData();
        this.layoutConfig = this.dockManager.layout;
        return this.dockManager;
    }

    getSavedLayoutListFromDB() {
        const props = this.getProjectParameters();
        const url = `igniteui/user_id`;
        this.api
            .postTypeRequest(url, { user_id: props?.userProps?.id })
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res) {
                        this.savedConfigurations = res?.['data'];
                        const defaultLayout = this.savedConfigurations.find((item) => item?.default_layout_selection);
                        if (defaultLayout?.data) {
                            this.dockManager.layout = JSON.parse(defaultLayout?.data);
                        }
                    }
                },
            });
    }

    updateLayoutConfig() {
        const url = `igniteui/update`;
        const props = this.getProjectParameters();
        const payload = {
            project_id: props?.projectId,
            user_id: props?.userProps?.id,
            layout_name: this.layoutName,
            data: JSON.stringify(this.layoutConfig),
        };
        this.api
            .patchTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.layoutName = null;
                        this.layoutDialog.close();
                        this.getSavedLayoutListFromDB();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Layout Configuration',
                            detail: 'Layout updated successfully',
                        });
                    }
                },
            });
    }

    createLayoutConfig() {
        const url = `igniteui/create`;
        const props = this.getProjectParameters();
        const payload = {
            project_id: props?.projectId,
            version_id: props?.version,
            user_id: props?.userProps?.id,
            layout_name: this.layoutName,
            data: JSON.stringify(this.layoutConfig),
        };
        this.api
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.layoutName = null;
                        this.layoutDialog.close();
                        this.getSavedLayoutListFromDB();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Layout Configuration',
                            detail: 'Layout saved successfully',
                        });
                    }
                },
            });
    }
    createOrUpdateLayoutConfig() {
        const matchedLayout = this.savedConfigurations.find((item) => item.layout_name === this.layoutName);
        if (matchedLayout) {
            this.updateLayoutConfig();
        } else {
            this.createLayoutConfig();
        }
    }

    getLayoutData(event) {
        this.selectConfig = event.value;
        this.layoutName = this.selectConfig?.layout_name;
    }

    activateLayout() {
        const url = `igniteui/layout`;
        const props = this.getProjectParameters();
        const payload = {
            user_id: props?.userProps?.id,
            layout_name: this.layoutName,
            default_layout_selection: 1,
        };
        this.api
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.getSavedLayoutListFromDB();
                    }
                },
            });
        if (this.selectConfig) {
            this.dockManager.layout = JSON.parse(this.selectConfig?.data);
            this.layoutDialog.close();
        }
    }

    deleteSelectedLayoutConfig() {
        const props = this.getProjectParameters();
        const url = `igniteui/delete`;
        const payload = {
            user_id: props?.userProps?.id,
            layout_name: this.selectConfig?.layout_name,
        };
        this.api
            .deleteTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.layoutDialog.close();
                        this.getSavedLayoutListFromDB();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Layout Configuration',
                            detail: 'Layout deleted successfully',
                        });
                        this.dockManager.layout = this.defaultLayoutData();
                    }
                },
            });
    }

    getIgniteLayoutData(url, payload) {
        return this.api.postTypeRequest(url, payload);
    }
    saveLayoutData(url, payload) {
        return this.api.postTypeRequest(url, payload);
    }
    updateLayoutData(url, payload) {
        return this.api.patchTypeRequest(url, payload);
    }
    deleteLayoutDate(url, payload) {
        return this.api.deleteTypeRequest(url, payload);
    }
    setRolePane(flag: boolean) {
        this.mappingStatus = flag;
    }

    defaultLayoutData() {
        const defaultLayout: IgcDockManagerLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 130,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.documentHost,
                                size: 200,
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
                                                    hidden: false,
                                                    allowFloating: false,
                                                    allowClose: false,
                                                },
                                                {
                                                    type: IgcDockManagerPaneType.contentPane,
                                                    header: 'Table',
                                                    contentId: 'table',
                                                    hidden: false,
                                                    allowFloating: false,
                                                    allowClose: false,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            {
                                type: IgcDockManagerPaneType.splitPane,
                                orientation: IgcSplitPaneOrientation.vertical,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.tabGroupPane,
                                        size: 200,
                                        panes: [
                                            {
                                                type: IgcDockManagerPaneType.contentPane,
                                                header: 'Translation Memory',
                                                contentId: 'translationmemory',
                                                hidden: true,
                                            },
                                        ],
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Menugraphics',
                                        contentId: 'menugraphics',
                                        hidden: true,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 200,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.translationHeader,
                                        contentId: 'translationid',
                                        hidden: false,
                                    },
                                ],
                            },
                            {
                                type: IgcDockManagerPaneType.splitPane,
                                orientation: IgcSplitPaneOrientation.horizontal,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.tabGroupPane,
                                        size: 200,
                                        panes: [
                                            {
                                                type: IgcDockManagerPaneType.contentPane,
                                                header: 'Properties',
                                                contentId: 'properties',
                                                hidden: true,
                                            },
                                        ],
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Mapping Proposals',
                                        contentId: 'mappingproposals',
                                        hidden: this.mappingStatus,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Unicode',
                                        contentId: 'unicode',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Dependencies',
                                        contentId: 'dependencies',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Preview',
                                        contentId: 'preview',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Textnode History',
                                        contentId: 'texthistory',
                                        hidden: true,
                                    },
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        header: 'Translation History',
                                        contentId: 'translationhistory',
                                        hidden: true,
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

    setLayoutOnChange(title, layout) {
        const layoutData = JSON.stringify(layout);
        localStorage.setItem('layoutdata', layoutData);
        const text = layoutData;
        const result = text.indexOf(title);
        const length = (title + '","hidden":').length;
        const dataselect = text[result + length];
        const dataselectl = result + length;
        const datad = this.split(text, dataselectl);
        if (dataselect == 'f') {
            const layoutFinal = datad[0] + true + datad[1].slice(5);
            return JSON.parse(layoutFinal);
        } else {
            const layoutFinal = datad[0] + false + datad[1].slice(4);
            return JSON.parse(layoutFinal);
        }
    }
    split(str, index) {
        return [str.slice(0, index), str.slice(index)];
    }
    setIconContextMenu(title, layout) {
        const layoutData = JSON.stringify(layout);
        const text = layoutData;
        const result = text.indexOf(title);
        const length = (title + '","hidden":').length;
        const dataselect = text[result + length];

        return dataselect === 'f';
    }
}
