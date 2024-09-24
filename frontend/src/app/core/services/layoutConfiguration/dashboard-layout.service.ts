import { Injectable } from '@angular/core';
import {
    IgcDockManagerLayout,
    IgcDockManagerPaneType,
    IgcSplitPaneOrientation,
} from '@infragistics/igniteui-dockmanager';
import { NgEventBus } from 'ng-event-bus';
@Injectable({
    providedIn: 'root',
})
export class DashboardLayoutService {
    titleData = {
        project: 'Projects',
        projectsDatails: 'Details of the Project',
        translation: 'Translation Requests',
        translationDetails: 'Details of the Translation Request',
        reviewOrders: 'Review Orders',
        versionHistoryDetails: 'Version History',
        document: 'Document',
    };
    defaultLayout: IgcDockManagerLayout;
    projectManagerOrders = 'Orders';
    translationManagerOrders = 'Jobs';
    translationOrder = 'Translation Requests';
    orderTitle = 'Order Overview';
    constructor(private eventBus: NgEventBus) {}
    getProjectTranslationItems() {
        return [
            {
                label: 'Language Selection',
                routerLink: 'language-selection',
            },
            {
                label: 'Job Details',
                routerLink: 'job-details',
            },
            {
                label: 'Documents',
                routerLink: 'documents',
            },
            {
                label: 'Filtering',
                routerLink: 'filter-translation-request',
            },
            {
                label: 'Statistics',
                routerLink: 'statistics',
            },
            {
                label: 'Confirmation',
                routerLink: 'translation-confirmation',
            },
        ];
    }

    getProjectCreationStepItems() {
        return [
            {
                label: 'Base File',
                routerLink: 'base-file',
            },
            {
                label: 'Properties',
                routerLink: 'properties-of-project',
            },
            {
                label: 'Language Settings',
                routerLink: 'language-setting',
            },
            {
                label: 'Language Inheritance',
                routerLink: 'language-inheritance',
            },
            {
                label: 'Resource',
                routerLink: 'resource',
            },
            {
                label: 'Users',
                routerLink: 'users',
            },
            {
                label: 'Confirmation',
                routerLink: 'confirmation-of-project',
            },
        ];
    }

    getlayout() {
        this.defaultLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
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
                                        header: this.titleData.project,
                                        contentId: 'projectslist',
                                        hidden: false,
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
                                                            header: this.titleData.projectsDatails,
                                                            contentId: 'viewdetails',
                                                            hidden: false,
                                                        },
                                                        {
                                                            type: IgcDockManagerPaneType.contentPane,
                                                            documentOnly: true,
                                                            allowClose: false,
                                                            header: this.titleData.versionHistoryDetails,
                                                            contentId: 'versionHistory',
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
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
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
                                                    header: this.titleData.translation,
                                                    contentId: 'translationrequest',
                                                    hidden: false,
                                                },
                                                {
                                                    type: IgcDockManagerPaneType.contentPane,
                                                    documentOnly: true,
                                                    allowClose: false,
                                                    header: this.titleData.reviewOrders,
                                                    contentId: 'reviewOrders',
                                                    hidden: false,
                                                },
                                            ],
                                        },
                                    ],
                                },
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
                                                allowClose: false,
                                                header: this.titleData.translationDetails,
                                                contentId: 'detailstr',
                                                hidden: false,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return this.defaultLayout;
    }

    setRowProgress(data, projectId, title, versionInDecimal) {
        return {
            project_id: projectId,
            existing_project_id: '',
            parent_project_id: null,
            version_no: versionInDecimal,
            version_name: '',
            user_id: null,
            title: title,
            group_node_count: 0,
            brand_id: 0,
            project_type: 0,
            editor_language: 0,
            translation_role: 0,
            placeholder: '',
            label_id: 0,
            status: '',
            due_date: data.due_date,
            date_created: data.date_created,
            description: '',
            text_node_count: 28,
            creator: '',
            language_inheritance_tree: '',
            progress_status: 100,
            language_prop: [],
        };
    }

    setRowChildProjectUpdate(data) {
        return {
            project_id: null,
            existing_project_id: '',
            parent_project_id: null,
            version_no: '00',
            version_name: 'default',
            user_id: null,
            title: data.title,
            group_node_count: null,
            brand_id: null,
            project_type: null,
            editor_language: null,
            translation_role: null,
            placeholder: '',
            label_id: null,
            status: '',
            due_date: data.due_date,
            date_created: data.date,
            description: '',
            text_node_count: null,
            creator: '',
            language_inheritance_tree: '',
            progress_status: '',
            language_prop: [],
        };
    }
    setRowChildProject(dataPropertiesofProject, version, duplicateDefault) {
        return {
            project_id: null,
            existing_project_id: '',
            parent_project_id: null,
            version_no: version,
            version_name: duplicateDefault,
            user_id: null,
            title: dataPropertiesofProject.projectName,
            group_node_count: null,
            brand_id: null,
            project_type: null,
            editor_language: null,
            translation_role: null,
            placeholder: '',
            label_id: null,
            status: '',
            due_date: dataPropertiesofProject.finalDelivery,
            date_created: dataPropertiesofProject.date,
            description: '',
            text_node_count: null,
            creator: '',
            language_inheritance_tree: '',
            progress_status: null,
            language_prop: [],
        };
    }

    getLayoutForProjectManagerDashboard(): IgcDockManagerLayout {
        return {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 200,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 150,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.projectManagerOrders,
                                        contentId: 'orders',
                                        hidden: false,
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
                                size: 50,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.titleData.translation,
                                        contentId: 'details',
                                        hidden: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
    }

    getlayoutDataCreator(rawProjectDockTitle: string): IgcDockManagerLayout {
        this.defaultLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 200,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 200,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: rawProjectDockTitle,
                                        contentId: 'rawProjectList',
                                        hidden: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return this.defaultLayout;
    }

    getlayoutTM() {
        this.defaultLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 200,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 150,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.translationManagerOrders,
                                        contentId: 'orders',
                                        hidden: false,
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
                                size: 50,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.titleData.translation,
                                        contentId: 'details',
                                        hidden: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return this.defaultLayout;
    }
    getlayoutTranslator() {
        this.defaultLayout = {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 200,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 150,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.translationOrder,
                                        contentId: 'orders',
                                        hidden: false,
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
                                size: 50,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: this.titleData.translation,
                                        contentId: 'details',
                                        hidden: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return this.defaultLayout;
    }
    changePmCount(count) {
        this.projectManagerOrders = 'Orders: ' + count;
    }
    changeTmCount(count) {
        this.translationManagerOrders = 'Jobs: ' + count;
    }
    changeTCount(count) {
        this.translationOrder = 'Translation Requests: ' + count;
    }

    changeEditorCount(count) {
        this.titleData.project = 'Projects: ' + count;
    }

    setTranslationRequestCount(count) {
        if (count === 0) {
            this.titleData['translation'] = 'Translation Requests';
            this.eventBus.cast('translationRequest:totalCount', count);
        } else {
            this.titleData['translation'] = 'Translation Requests: ' + count;
        }
    }

    getDefaultLayout(contentId: string, headerTitle = this.orderTitle): IgcDockManagerLayout {
        return {
            rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                panes: [
                    {
                        type: IgcDockManagerPaneType.splitPane,
                        orientation: IgcSplitPaneOrientation.vertical,
                        size: 200,
                        panes: [
                            {
                                type: IgcDockManagerPaneType.tabGroupPane,
                                size: 150,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: headerTitle,
                                        contentId: contentId,
                                        hidden: false,
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
                                size: 50,
                                panes: [
                                    {
                                        type: IgcDockManagerPaneType.contentPane,
                                        allowClose: false,
                                        header: 'Details',
                                        contentId: 'document',
                                        hidden: false,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
    }

    proofreaderOrdersCount(count) {
        this.orderTitle = 'Orders: ' + count;
    }

    setCountToReviewOrders(count) {
        if (count === 0) {
            this.titleData.reviewOrders = 'Review Orders';
        } else {
            this.titleData.reviewOrders = 'Review Orders: ' + count;
        }
    }
}
