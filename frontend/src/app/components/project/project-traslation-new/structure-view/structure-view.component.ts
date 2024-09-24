import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { MenuItem, TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';
import { Subject, Subscription, catchError, of, takeUntil } from 'rxjs';
import {
    Direction,
    GroupnodeType,
    NavigationTypes,
    NodeLevelType,
    Roles,
    Status,
    TextNodeStatus,
    TextnodeType,
    TranslationStatus,
    TranslationViewType,
    Type,
    UnresolvedSymbols,
    tableIcons,
} from 'src/Enumerations';

import { CommentsService } from 'src/app/core/services/project/project-translation/comments.service';
import { NavigationService } from 'src/app/core/services/project/project-translation/navigation.service';
import { PlaceholderService } from 'src/app/core/services/project/project-translation/placeholder.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { TextNodePropertiesService } from 'src/app/core/services/project/project-translation/text-node-properties.service';
import { TranslationHistoryService } from 'src/app/core/services/project/project-translation/translation-history.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ReviewTypes } from '../review-types';
import { TranslationChildNodeRequestModel, TranslationTreeNodeRequestModel } from '../translation-request-model';
@Component({
    selector: 'app-structure-view',
    templateUrl: './structure-view.component.html',
    styleUrls: ['./structure-view.component.scss'],
})
export class StructureViewComponent implements OnInit, OnDestroy {
    @ViewChild('tt') mtree: TreeTable;
    treeActionItems: MenuItem[];
    structureData: TreeNode[] = [];
    structureColumns = [];
    loading = true;
    selectedTreeNode: TreeNode;
    editorLanguageCode: string;
    nodeForStructureIndex = 0;
    childTextNode;
    sectctedGroudNode;
    statusIcon = Status;
    grpNodeType = GroupnodeType;
    textnodeType = TextnodeType;
    tableIcons = tableIcons;
    textnodeStatus = TextNodeStatus;
    sourceText: string;
    traslationText = '';
    sharedDataObject: any = {};
    childDataPayload: object;
    isTextChangeMsgVisible = false;
    totalTextnodeCount = 0;
    private tableFilterObject;
    unresolvedSymbols = UnresolvedSymbols;
    proofreaderLanguage;
    currentUser = null;
    propertyWindowsUpdateSubscription = null;
    isEditor: boolean;
    isTranslator: boolean;
    isProofreader: boolean;
    destroyed$ = new Subject<boolean>();
    structureSubscription: Subscription;
    isReviewer: boolean;
    statusNotAvailable: string;
    Roles = Roles;
    @Input() excludeMetaTextCount = 0;
    constructor(
        private projectTranslationService: ProjectTranslationService,
        private eventBus: NgEventBus,
        public textNodePropertiesService: TextNodePropertiesService,
        public translationHistoryService: TranslationHistoryService,
        public navigationService: NavigationService,
        private placeholderService: PlaceholderService,
        private userService: UserService,
        private commentService: CommentsService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.userService.getUser();
        this.onLoad();
        this.statusNotAvailable = this.projectTranslationService.statusNotAvailable;
        //if placeholder changes reload property view
        this.propertyWindowsUpdateSubscription = this.eventBus
            .on('properties-window:update')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: async () => {
                    this.updatePropertiesWindow();
                },
                error: (err) => {
                    throw new Error(`Response is not ok ${err}`);
                },
            });

        this.eventBus
            .on('translateData:onStructureSelect')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: async () => {
                    if (this.projectTranslationService.tableSelectedRow.group_path.length > 0) {
                        let currentNode: TreeNode[] = [...this.structureData];

                        await this.projectTranslationService.tableSelectedRow.group_path.reduce(
                            async (prevgroupNode, groupNode) => {
                                // Wait for the previous item to finish processing
                                await prevgroupNode;
                                // Process this item
                                if (currentNode?.length > 0) {
                                    const foundNode = currentNode.find(
                                        (node) =>
                                            node?.data.context === groupNode?.name &&
                                            node.data.Id === groupNode?.node_id
                                    );
                                    await this.onNodeExpand({ node: foundNode }).then(() => {
                                        currentNode =
                                            currentNode.find(
                                                (node) =>
                                                    node?.data.context === groupNode?.name &&
                                                    node.data.Id === groupNode?.node_id
                                            )?.children || [];
                                    });
                                    if (
                                        this.projectTranslationService.tableSelectedRow.group_path.length - 1 ===
                                        this.projectTranslationService.tableSelectedRow.group_path.findIndex(
                                            (node) => node === groupNode
                                        )
                                    ) {
                                        this.selectedTreeNode = currentNode.find(
                                            (textNode) =>
                                                textNode.data.db_text_node_id ===
                                                this.projectTranslationService.tableSelectedRow.db_text_node_id
                                        );
                                        if (this.projectTranslationService.textNodeSaved) {
                                            this.projectTranslationService.textNodeSaved = false;
                                        }
                                        this.selectTreeNode();
                                    }
                                }
                            },
                            Promise.resolve()
                        );
                        if (!this.projectTranslationService.filterAppliedInStructure) {
                            this.projectTranslationService.filterAppliedInStructure = true;
                            this.loadStructureDataLazy();
                        }
                    }
                },
                error: (err) => {
                    throw new Error(`Response is not ok ${err}`);
                },
            });

        this.eventBus.on('structure:navigation').subscribe(async (data: MetaData) => {
            this.currentUser = this.userService.getUser();
            let selectedGroup = null;
            let selectedIndex = 0;
            if (data.data.filterBy === 'view') {
                this.viewNavigation(data);
            } else {
                if (data.data.action === Direction.ToFirst || data.data.action === Direction.ToLast) {
                    let textNode = null;
                    selectedGroup =
                        data.data.action === Direction.ToFirst
                            ? this.structureData[0]
                            : this.structureData[this.structureData.length - 1];
                    if (selectedGroup) {
                        do {
                            if (selectedGroup?.children?.length > 0) {
                                selectedGroup.expanded = true;
                                const allChildGroupNode = this.getAllChildGroupNode(selectedGroup, data);
                                const allTextNode = this.getAllTextNodeForToFirstAndToLast(data, selectedGroup);

                                if (allChildGroupNode?.length > 0) {
                                    selectedGroup =
                                        data.data.action === Direction.ToFirst
                                            ? allChildGroupNode[0]
                                            : allChildGroupNode[allChildGroupNode.length - 1];
                                } else if (allTextNode?.length > 0) {
                                    textNode =
                                        data.data.action === Direction.ToFirst
                                            ? allTextNode[0]
                                            : allTextNode[allTextNode.length - 1];
                                    this.selectedTreeNode = textNode;
                                    this.selectTreeNode();
                                } else {
                                    textNode = ' ';
                                }
                                this.structureData = [...this.structureData];
                            } else {
                                const firstViewName = this.structureData[0].data.context;
                                await this.onNodeExpand({ node: selectedGroup, viewName: firstViewName }).then(() => {
                                    selectedGroup.expanded = true;
                                    const allTextNode = selectedGroup?.children?.filter(
                                        (item) =>
                                            item?.data?.['TextNodeId'] &&
                                            (!data.data.filterBy || item?.data?.state !== TranslationStatus.Done)
                                    );
                                    const allChildGroupNode = selectedGroup?.children?.filter(
                                        (item) =>
                                            item?.data?.['Id'] &&
                                            item?.data?.nodeCount > 0 &&
                                            (!data.data.filterBy ||
                                                item?.data?.nodeCount > item?.data?.doneCount ||
                                                item?.data?.proofreadRejectedCount > 0 ||
                                                item?.data?.reviewRejectedCount > 0 ||
                                                item?.data?.isExceptionNodesAvailable)
                                    );

                                    if (allChildGroupNode?.length > 0) {
                                        selectedGroup =
                                            data.data.action === Direction.ToFirst
                                                ? allChildGroupNode[0]
                                                : allChildGroupNode[allChildGroupNode.length - 1];
                                    } else if (allTextNode?.length > 0) {
                                        textNode =
                                            data.data.action === Direction.ToFirst
                                                ? allTextNode[0]
                                                : allTextNode[allTextNode.length - 1];
                                        this.selectedTreeNode = textNode;
                                        this.selectTreeNode();
                                    } else {
                                        textNode = ' ';
                                    }
                                    this.structureData = [...this.structureData];
                                });
                            }
                        } while (!textNode && selectedGroup);
                    }
                } else {
                    if (this.selectedTreeNode?.data?.['ID'] && !this.selectedTreeNode?.children) {
                        this.selectedTreeNode = this.selectedTreeNode?.parent;
                        this.selectTreeNode();
                    }
                    if (this.selectedTreeNode) {
                        if (this.selectedTreeNode?.data?.['TextNodeId']) {
                            selectedIndex = this.getSelectedTextNodeIndex();
                            if (
                                selectedIndex < this.selectedTreeNode.parent?.children.length - 1 &&
                                !this.selectedTreeNode.parent.children[selectedIndex + 1]?.data?.['TextNodeId'] &&
                                data.data.action === 'next' &&
                                this.selectedTreeNode.parent?.children[selectedIndex + 1].data.nodeCount > 0
                            ) {
                                selectedGroup = this.selectedTreeNode.parent?.children[selectedIndex + 1];
                            } else {
                                selectedGroup = this.selectedTreeNode.parent;
                            }
                        } else {
                            selectedGroup = this.selectedTreeNode;
                        }
                    }
                    if (
                        !this.navigationService.findTextNode(this.structureData) &&
                        this.selectedTreeNode === undefined
                    ) {
                        const groupnode = this.navigationService.findGroupNode(
                            this.structureData,
                            null,
                            'first',
                            data.data.filterBy
                        );

                        groupnode &&
                            this.onNodeExpand({ node: groupnode?.[groupnode?.length - 1] }).then(() => {
                                for (const node of groupnode) {
                                    if (!node?.data?.['TextNodeId']) {
                                        node.expanded = true;
                                        this.structureData = [...this.structureData];
                                    }
                                }
                                const textNode = this.navigationService.findTextNode(
                                    this.structureData,
                                    data?.data?.filterBy
                                );
                                this.selectedTreeNode = textNode[textNode.length - 1];
                                this.selectTreeNode();
                            });
                    } else {
                        const roleWiseTextNode = this.getRoleWiseTextNodeData(data?.data?.action, data?.data?.filterBy);

                        if (
                            selectedIndex < this.selectedTreeNode?.parent?.children?.length - 1 &&
                            this.selectedTreeNode.parent.children[selectedIndex + 1]?.data?.['TextNodeId'] &&
                            data.data.action === 'next' &&
                            !this.selectedTreeNode?.data?.['Id'] &&
                            (!data.data.filterBy || roleWiseTextNode.length > 0)
                        ) {
                            if (!data.data.filterBy) {
                                this.selectedTreeNode = this.selectedTreeNode.parent.children[selectedIndex + 1];
                            } else {
                                this.selectedTreeNode = roleWiseTextNode[0];
                            }
                            this.selectTreeNode();
                        } else if (
                            selectedGroup?.data?.['Id'] &&
                            selectedGroup?.data?.nodeCount > 0 &&
                            data.data.action === 'next' &&
                            !selectedGroup?.children?.filter(
                                (item) =>
                                    item?.data?.['Id'] &&
                                    (!data.data.filterBy ||
                                        ((data.data.filterBy === 'unfinished' ||
                                            data.data.filterBy === 'proofread' ||
                                            data.data.filterBy === 'reviewer') &&
                                            (item?.data?.nodeCount > item?.data?.doneCount ||
                                                item?.data?.proofreadRejectedCount > 0 ||
                                                item?.data?.reviewRejectedCount > 0)) ||
                                        (data.data.filterBy === 'done' && item?.data?.doneCount > 0) ||
                                        (data.data.filterBy === NavigationTypes.Exception &&
                                            item?.data?.isExceptionNodesAvailable))
                            )
                        ) {
                            if (!selectedGroup?.children) {
                                await this.onNodeExpand({ node: selectedGroup }).then(() => {
                                    selectedGroup.expanded = true;
                                    this.selectedTreeNode = this.getSelectedDoneTreeNodes(data, selectedGroup);
                                    this.selectTreeNode();
                                });
                            }
                        } else if (
                            data.data.action === 'previous' &&
                            this.getSelectedGroupDoneOrUnfinishedNode(data, selectedGroup) &&
                            selectedIndex === 0
                        ) {
                            const allTextNode = this.getAllTextNode(data, selectedGroup);
                            this.selectedTreeNode = allTextNode[allTextNode.length - 1];
                            this.selectTreeNode();
                        } else if (
                            data.data.action === 'previous' &&
                            selectedIndex > 0 &&
                            (!data.data.filterBy || roleWiseTextNode.length > 0)
                        ) {
                            if (!data.data.filterBy) {
                                this.selectedTreeNode = this.selectedTreeNode.parent.children[selectedIndex - 1];
                            } else {
                                this.selectedTreeNode = roleWiseTextNode[roleWiseTextNode.length - 1];
                            }
                            this.selectTreeNode();
                        } else if (
                            data.data.action === 'previous' &&
                            (selectedIndex === 0 || roleWiseTextNode.length === 0)
                        ) {
                            let textNode = null;
                            let allChildGroup = null;
                            let selectedGroupIndex = -1;
                            let prevGroup = null;
                            let currentSelectedGroupIndex = -1;
                            let isCurrentSelectionVisited = true;
                            do {
                                allChildGroup = this.getAllChildGroup(selectedGroup, data);
                                selectedGroupIndex = allChildGroup?.findIndex(
                                    (item) => item.data?.['Id'] && item?.data?.Id === selectedGroup?.data?.Id
                                );
                                prevGroup = { ...selectedGroup };

                                if (selectedGroupIndex > 0 && allChildGroup?.length > 0 && isCurrentSelectionVisited) {
                                    selectedGroup = allChildGroup[selectedGroupIndex - 1];
                                } else {
                                    if (!selectedGroup?.parent) {
                                        const rootParentIndex = this.structureData.findIndex(
                                            (structureItem) =>
                                                structureItem?.data?.Id === selectedGroup.data.Id &&
                                                structureItem?.data?.context === selectedGroup.data.context
                                        );

                                        if (rootParentIndex > 0 && rootParentIndex > -1 && isCurrentSelectionVisited) {
                                            selectedGroup = this.structureData[rootParentIndex - 1];
                                        } else {
                                            selectedGroup = isCurrentSelectionVisited
                                                ? selectedGroup?.parent
                                                : selectedGroup;
                                        }
                                    } else {
                                        selectedGroup = isCurrentSelectionVisited
                                            ? selectedGroup?.parent
                                            : selectedGroup;
                                    }
                                }
                                if (!selectedGroup?.parent) {
                                    currentSelectedGroupIndex = this.structureData?.findIndex(
                                        (item) =>
                                            item?.data?.Id === selectedGroup?.data?.Id &&
                                            item?.data?.sequence_no === selectedGroup?.data?.sequence_no
                                    );
                                } else {
                                    currentSelectedGroupIndex = selectedGroup?.parent?.children?.findIndex(
                                        (item) =>
                                            item?.data?.Id === selectedGroup?.data?.Id &&
                                            item?.data?.sequence_no === selectedGroup?.data?.sequence_no
                                    );
                                }
                                if (
                                    selectedGroup?.children?.filter(
                                        (item) =>
                                            item?.data?.['TextNodeId'] &&
                                            (!data.data.filterBy || item?.data?.state !== TranslationStatus.Done)
                                    ) &&
                                    !selectedGroup?.children?.filter((item) => item?.data?.['Id'])
                                ) {
                                    const allTextNode = this.getChildrenAllTextNode(selectedGroup, data);
                                    textNode = allTextNode[allTextNode.length - 1];
                                    this.selectedTreeNode = textNode;
                                    this.selectTreeNode();
                                } else if (selectedGroup?.data?.nodeCount > 0) {
                                    if (
                                        prevGroup.parent !== selectedGroup ||
                                        (selectedGroupIndex > currentSelectedGroupIndex &&
                                            prevGroup.parent === selectedGroup)
                                    ) {
                                        do {
                                            isCurrentSelectionVisited = true;
                                            if (selectedGroup?.children?.length > 0) {
                                                selectedGroup.expanded = true;
                                                const allTextNode = this.getChildrenAllTextNode(selectedGroup, data);
                                                const allChildGroupNode = this.getAllChildGroupNode(
                                                    selectedGroup,
                                                    data
                                                );

                                                if (allChildGroupNode?.length > 0) {
                                                    selectedGroup = allChildGroupNode[allChildGroupNode.length - 1];
                                                } else if (allTextNode?.length > 0) {
                                                    textNode = allTextNode[allTextNode.length - 1];
                                                    this.selectedTreeNode = textNode;
                                                    this.selectTreeNode();
                                                }
                                            } else {
                                                await this.onNodeExpand({ node: selectedGroup }).then(() => {
                                                    selectedGroup.expanded = true;
                                                    const allTextNode = this.getChildrenAllTextNode(
                                                        selectedGroup,
                                                        data
                                                    );
                                                    const allChildGroupNode = this.getAllChildGroupNode(
                                                        selectedGroup,
                                                        data
                                                    );

                                                    if (allChildGroupNode?.length > 0) {
                                                        selectedGroup = allChildGroupNode[allChildGroupNode.length - 1];
                                                    } else if (allTextNode?.length > 0) {
                                                        textNode = allTextNode[allTextNode.length - 1];
                                                        this.selectedTreeNode = textNode;
                                                        this.getRowOnClick({
                                                            node: this.selectedTreeNode,
                                                        });
                                                        this.structureData = [...this.structureData];
                                                        this.projectTranslationService.ScrollToSelectedItem(
                                                            this.mtree,
                                                            'translationtree'
                                                        );
                                                    }
                                                });
                                            }
                                        } while (!textNode && selectedGroup);
                                    } else {
                                        if (currentSelectedGroupIndex > 0 && selectedGroup?.parent) {
                                            selectedGroup =
                                                selectedGroup?.parent?.children[currentSelectedGroupIndex - 1];
                                            selectedGroup.expanded = true;
                                            this.structureData = [...this.structureData];
                                            isCurrentSelectionVisited = false;
                                        }
                                    }
                                }
                                if (!selectedGroup) {
                                    this.eventBus.cast('structure:navigation', {
                                        action: Direction.ToLast,
                                        filterBy: data.data.filterBy,
                                    });
                                    //move to last
                                }
                            } while (!textNode && selectedGroup);
                        } else {
                            let textNode = null;
                            let allChildGroup = null;
                            let selectedGroupIndex = -1;
                            let nextGroup = null;
                            let currentSelectedGroupIndex = -1;
                            let isCurrentSelectionVisited = true;
                            do {
                                allChildGroup = this.getAllChildGroup(selectedGroup, data);
                                selectedGroupIndex = allChildGroup?.findIndex(
                                    (item) => item.data?.['Id'] && item?.data?.Id === selectedGroup?.data?.Id
                                );
                                nextGroup = { ...selectedGroup };

                                if (
                                    selectedGroupIndex >= 0 &&
                                    selectedGroupIndex < allChildGroup?.length - 1 &&
                                    allChildGroup?.length > 0
                                ) {
                                    selectedGroup = allChildGroup[selectedGroupIndex + 1];
                                } else {
                                    if (!selectedGroup?.parent) {
                                        const rootParentIndex = this.structureData.findIndex(
                                            (structureItem) =>
                                                structureItem?.data?.Id === selectedGroup.data.Id &&
                                                structureItem?.data?.context === selectedGroup.data.context
                                        );

                                        if (
                                            rootParentIndex < this.structureData.length &&
                                            rootParentIndex > -1 &&
                                            isCurrentSelectionVisited
                                        ) {
                                            selectedGroup = this.structureData[rootParentIndex + 1];
                                        } else {
                                            selectedGroup = isCurrentSelectionVisited
                                                ? selectedGroup?.parent
                                                : selectedGroup;
                                        }
                                    } else {
                                        selectedGroup = selectedGroup?.parent;
                                    }
                                }
                                if (!selectedGroup?.parent) {
                                    currentSelectedGroupIndex = this.structureData?.findIndex(
                                        (item) =>
                                            item?.data?.Id === selectedGroup?.data?.Id &&
                                            item?.data?.sequence_no === selectedGroup?.data?.sequence_no
                                    );
                                } else {
                                    currentSelectedGroupIndex = selectedGroup?.parent?.children?.findIndex(
                                        (item) =>
                                            item?.data?.Id === selectedGroup?.data?.Id &&
                                            item?.data?.sequence_no === selectedGroup?.data?.sequence_no
                                    );
                                }

                                if (
                                    this.getChildrenAllTextNode(selectedGroup, data) &&
                                    !selectedGroup?.children?.filter((item) => item?.data?.['Id'])
                                ) {
                                    const allTextNode = this.getChildrenAllTextNode(selectedGroup, data);

                                    textNode = allTextNode[0];
                                    this.selectedTreeNode = textNode;
                                    this.selectTreeNode();
                                } else if (selectedGroup?.data?.nodeCount > 0) {
                                    if (
                                        nextGroup.parent !== selectedGroup ||
                                        (selectedGroupIndex > currentSelectedGroupIndex &&
                                            nextGroup.parent === selectedGroup &&
                                            selectedGroupIndex < allChildGroup?.length - 1)
                                    ) {
                                        do {
                                            isCurrentSelectionVisited = true;
                                            if (selectedGroup?.children?.length > 0) {
                                                selectedGroup.expanded = true;
                                                const allTextNode = this.getChildrenAllTextNode(selectedGroup, data);
                                                const allChildGroupNode = this.getAllChildGroupNode(
                                                    selectedGroup,
                                                    data
                                                );

                                                if (allChildGroupNode?.length > 0) {
                                                    selectedGroup = allChildGroupNode[0];
                                                } else if (allTextNode?.length > 0) {
                                                    textNode = allTextNode[0];
                                                    this.selectedTreeNode = textNode;
                                                    this.selectTreeNode();
                                                }
                                                this.structureData = [...this.structureData];
                                            } else {
                                                await this.onNodeExpand({ node: selectedGroup }).then(() => {
                                                    selectedGroup.expanded = true;
                                                    const allTextNode = this.getChildrenAllTextNode(
                                                        selectedGroup,
                                                        data
                                                    );
                                                    const allChildGroupNode = this.getAllChildGroupNode(
                                                        selectedGroup,
                                                        data
                                                    );

                                                    if (allChildGroupNode?.length > 0) {
                                                        selectedGroup = allChildGroupNode[0];
                                                    } else if (allTextNode?.length > 0) {
                                                        textNode = allTextNode[0];
                                                        this.selectedTreeNode = textNode;
                                                        this.getRowOnClick({
                                                            node: this.selectedTreeNode,
                                                        });
                                                        this.structureData = [...this.structureData];
                                                        this.projectTranslationService.ScrollToSelectedItem(
                                                            this.mtree,
                                                            'translationtree'
                                                        );
                                                    }
                                                });
                                            }
                                        } while (!textNode && selectedGroup);
                                    } else {
                                        if (currentSelectedGroupIndex < this.structureData.length - 1) {
                                            selectedGroup =
                                                this.structureData[0].children[currentSelectedGroupIndex + 1];
                                            selectedGroup.expanded = true;
                                            this.structureData = [...this.structureData];
                                            isCurrentSelectionVisited = false;
                                        }
                                    }
                                }
                                if (!selectedGroup) {
                                    this.eventBus.cast('structure:navigation', {
                                        action: Direction.ToFirst,
                                        filterBy: data.data.filterBy,
                                    });
                                }
                            } while (!textNode && selectedGroup);
                        }
                    }
                }
            }
        });

        this.navigateAndSelectNode();

        this.structureSubscription = this.projectTranslationService.filterRemovedInTable.subscribe((res: boolean) => {
            if (res) {
                this.tableFilterObject = {};
            }
        });
    }

    ngOnDestroy(): void {
        this.currentUser = null;
        if (this.structureSubscription) {
            this.structureSubscription.unsubscribe();
        }
        this.destroyed$.next(true);
        if (this.propertyWindowsUpdateSubscription) {
            this.propertyWindowsUpdateSubscription.unsubscribe();
        }
        this.structureData.length = 0;
    }

    onLoad() {
        const props = this.projectTranslationService.getProjectParameters();
        this.proofreaderLanguage = props?.proofreaderLangCode;
        this.loadStructureDataLazy();
        this.initializeRoles();
        const childURL = this.currentUser?.role === Roles.reviewer ? `review/child-data` : `tree-format/child_data`;
        this.eventBus.on('translate:textareaValue').subscribe({
            next: (res: MetaData) => {
                if (this.selectedTreeNode) {
                    this.selectedTreeNode['data']['translation'] = res.data;
                    if (this.projectTranslationService.selectedRow['data']?.['state'] !== 'Unresolved font') {
                        if (this.selectedTreeNode['data']['translation'].length === 0) {
                            this.selectedTreeNode['data']['state'] = 'Unworked';
                            this.projectTranslationService.state = 'Unworked';
                        } else {
                            if (
                                this.projectTranslationService.isCurrentTranslationCharacterInLimit() ||
                                this.projectTranslationService.hasUnresolvedCharacters
                            ) {
                                return;
                            }
                            this.selectedTreeNode['data']['state'] = 'Work in progress';
                            this.projectTranslationService.state = 'Work in progress';
                            if (this.selectedTreeNode['children']) {
                                if (
                                    this.selectedTreeNode?.['children'].find(
                                        (item) => item?.data?.state == TranslationStatus.Done
                                    )
                                ) {
                                    this.projectTranslationService.getUserInput(true);
                                } else {
                                    this.projectTranslationService.getUserInput(false);
                                }
                            }
                        }
                    } else {
                        if (
                            this.selectedTreeNode['data']['translation'].length === 0 &&
                            (this.projectTranslationService.oldSelectedRow['state'] !== 'Unresolved font' ||
                                this.projectTranslationService.selectedRow['data']?.['state'] !== 'Unresolved font')
                        ) {
                            this.selectedTreeNode['data']['state'] = 'Unworked';
                            this.projectTranslationService.state = 'Unworked';
                        }
                    }
                }
            },
            error: (err) => {
                throw new Error(`Response is not ok ${err}`);
            },
        });
        this.eventBus
            .on('structure:textnodeupdate')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (data: MetaData) => {
                    if (data.data) {
                        const currentTextNodeGroupNodes = this.navigationService
                            .findTargetTextNode(this.selectedTreeNode, this.structureData)
                            ?.filter((node) => node?.data?.Id);
                        if (currentTextNodeGroupNodes?.length > 0)
                            this.childDataPayload['node_id'] =
                                currentTextNodeGroupNodes[currentTextNodeGroupNodes?.length - 1]?.data?.Id;
                        if (this.childDataPayload) {
                            if (this.tableFilterObject?.filter) {
                                this.childDataPayload['filter'] = this.tableFilterObject.filter;
                            }
                            this.projectTranslationService
                                .getTranslateTreeData(childURL, this.childDataPayload)
                                .pipe(catchError(() => of(undefined)))
                                .subscribe({
                                    next: (res) => {
                                        if (res?.['status'] === 'OK') {
                                            this.loading = false;
                                            const index = res['data'].findIndex(
                                                (item) =>
                                                    (item.data?.TextNodeId ===
                                                        this.selectedTreeNode?.data?.TextNodeId ||
                                                        item?.data?.TextNodeId ===
                                                            this.selectedTreeNode?.parent?.data?.TextNodeId) &&
                                                    (item.data?.context === this.selectedTreeNode?.data?.context ||
                                                        item.data?.context ===
                                                            this.selectedTreeNode?.parent?.data?.context)
                                            );
                                            if (this.selectedTreeNode?.data?.['ID']) {
                                                Object.assign(
                                                    this.selectedTreeNode.parent.data,
                                                    res['data'][index].data
                                                );
                                                Object.assign(
                                                    this.selectedTreeNode.parent.children,
                                                    res['data'][index].children
                                                );
                                            } else {
                                                Object.assign(this.selectedTreeNode.data, res['data'][index]?.data);
                                                Object.assign(
                                                    this.selectedTreeNode.children,
                                                    res['data'][index]?.children
                                                );
                                            }

                                            this.structureData = [...this.structureData];
                                            const row = { node: this.selectedTreeNode };
                                            const currentTextNodeState = this.isGroupNode(
                                                this.projectTranslationService.selectedRow['data']
                                            )
                                                ? res['data'][index]?.['data']?.state
                                                : this.projectTranslationService.selectedRow['data'].state;

                                            this.projectTranslationService.setProjectTranslationData(
                                                currentTextNodeState
                                            );

                                            this.getRowOnClick(row);
                                            if (data.data?.['isNext']) {
                                                this.eventBus.cast('structure:navigation', {
                                                    action: 'next',
                                                });
                                            }
                                        }
                                    },
                                });
                        }
                    }
                },
                error: (err) => {
                    throw new Error(`Response is not ok ${err}`);
                },
            });

        if (this.currentUser?.role === Roles.editor) {
            this.totalTextnodeCount = this.projectTranslationService.getProjectParameters().textNodeCount;
        }

        if (this.currentUser?.role === Roles['editor']) {
            this.editorLanguageCode = props?.editorLanguageCode.trim();
        } else if (this.currentUser?.role === Roles['translator']) {
            this.editorLanguageCode = props?.sourceLangCode.trim();
        }

        this.eventBus
            .on('translateData:afterOnTableFilter')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: MetaData) => {
                if (res.data) {
                    this.tableFilterObject = res.data;
                    if (this.tableFilterObject) {
                        const payload = {
                            project_id: props?.projectId,
                            version_id: props?.version,
                            role: Roles[this.currentUser?.role],
                            start_row: 0,
                            end_row: 100,
                            language_code: this.tableFilterObject?.language_code,
                            sort: this.tableFilterObject.sort,
                            filter: this.tableFilterObject?.filter,
                            translation_request_id: props?.translationRequestId,
                        };
                        if (this.currentUser?.role === Roles.reviewer) {
                            payload['reviewType'] = props?.reviewType;
                        }
                        this.loadStructureDataByTableFilter(payload);
                    }
                }
            });
    }

    loadStructureDataLazy() {
        this.loading = true;
        const treeURL = this.currentUser?.role === Roles['reviewer'] ? `review/tree-data` : `tree-format/tree-data`;
        const props = this.projectTranslationService.getProjectParameters();
        const lang = this.projectTranslationService.getLanguageCode(this.currentUser?.role, props);
        this.projectTranslationService
            .getTranslateTreeData(treeURL, this.getTreeDataApiRequestPayload(lang, props, null, '', '', ''))
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.loading = false;
                    this.structureData = res?.['data'];
                    if (this.currentUser?.role === Roles['editor']) {
                        this.editorLanguageCode = props?.editorLanguageCode.trim();
                    } else if (this.currentUser?.role === Roles['translator']) {
                        this.editorLanguageCode = props?.sourceLangCode.trim();
                    }
                    this.eventBus.cast('structure:navigation', {
                        action: Direction.ToFirst,
                    });
                }
            });
    }

    getRowOnClick(row) {
        this.traslationText = '';
        this.treeActionItems = this.projectTranslationService.getContextMenu(row, 'structure', this.selectedTreeNode);
        const props = this.projectTranslationService.getProjectParameters();

        const userLanguage = this.projectTranslationService.getLanguageCode(this.currentUser?.role, props);
        this.projectTranslationService.statusWiseContextMenu(
            row?.node?.data?.locked,
            row?.node?.data?.state,
            this.treeActionItems
        );
        this.selectedTreeNode = row.node;
        let translateObj = {};
        if (this.isGroupNode(row.node?.data)) {
            this.commentService.setTextNodeForComments(0, 0);
            this.projectTranslationService.resetMappedStatus();
        }
        this.sharedDataObject.treeNode = this.selectedTreeNode;
        if (row?.node?.data?.Type !== 'Module') {
            this.sourceText = row?.node?.data?.TextNodeId
                ? row?.node?.data?.['context']
                : row?.node?.parent?.data?.['context'];
        }
        let foreginLangCode;
        if (row?.node?.data?.TextNodeId) {
            this.traslationText = row?.node?.data?.translation || '';
            foreginLangCode = this.editorLanguageCode;
        } else if (!row?.node?.data?.Type) {
            this.traslationText = row?.node?.data?.translation || '';
            foreginLangCode = row?.node?.data?.context;
        }
        if (row?.node?.data?.['TextNodeId'] || row?.node?.data?.['ID'] || row?.node?.data?.['Id']) {
            if (row?.node?.data?.['TextNodeId'] || row?.node?.data?.['ID']) {
                this.projectTranslationService.allParentGroup = this.navigationService
                    .findTargetTextNode(row.node, this.structureData)
                    ?.filter((item) => !item?.data?.['TextNodeId'] && !item?.data?.['ID']);
                translateObj = {
                    source: this.sourceText,
                    translation: this.traslationText,
                    editorLanguage: this.editorLanguageCode,
                    foreginLangCode: foreginLangCode,
                    state: row?.node?.data?.state,
                    lockSatus: row?.node?.data?.locked,
                };
                const textNodes = this.getSelectedTreeNode();
                this.commentService.setLanguagesFromTextNode([textNodes], userLanguage);
                this.projectTranslationService.getSelectedRow(this.selectedTreeNode, this.traslationText);
            } else {
                this.projectTranslationService.allParentGroup = this.navigationService.findTargetGroupNode(
                    row.node,
                    this.structureData
                );
                this.projectTranslationService.structureSelectedRow = {};
            }

            const breadcrumb = this.projectTranslationService.allParentGroup?.map((item) => ({
                label: item?.data?.context,
            }));
            this.eventBus.cast('structure:breadcrumb', breadcrumb);
        } else {
            translateObj = {
                source: null,
                translation: null,
            };
        }
        this.sharedDataObject.translateObj = translateObj;
        this.sharedDataObject.type = TranslationViewType['structure'];
        if (!this.isProofreader && !this.isReviewer) this.updatePropertiesWindow();
        this.eventBus.cast('translateData:translateObj', this.sharedDataObject);
        if (row?.node?.data?.isReferenceLanguage) {
            this.projectTranslationService.activeEditorOptions.readonly = true;
        }
    }

    updatePropertiesWindow() {
        this.textNodePropertiesService.getSelectedRow(this.sharedDataObject);
    }

    async onNodeExpand(event) {
        return new Promise((resolve) => {
            const childURL =
                this.currentUser?.role === Roles['reviewer'] ? `review/child-data` : `tree-format/child_data`;
            const props = this.projectTranslationService.getProjectParameters();
            const userLanguage = this.projectTranslationService.getLanguageCode(this.currentUser?.role, props);
            this.loading = true;
            const node = event.node;
            // const groupId = event.node;

            this.nodeForStructureIndex = this.structureData.findIndex((e) => e.data.Id == node?.data?.Id);
            if (node?.data?.Id) {
                if (node?.children?.length > 0) {
                    event.node.expanded = true;
                    resolve('first Node Expanded');
                    this.loading = false;
                } else {
                    const treeChild = this.getTreeDataApiRequestPayload(
                        userLanguage,
                        props,
                        node?.data?.Id,
                        'child-data',
                        node?.parent?.data?.context || event?.viewName,
                        node?.data?.context
                    );

                    this.childDataPayload = treeChild;
                    if (this.tableFilterObject?.filter) {
                        this.childDataPayload['filter'] = this.tableFilterObject.filter;
                    }
                    this.projectTranslationService
                        .getTranslateTreeData(childURL, treeChild)
                        .pipe(catchError(() => of(undefined)))
                        .subscribe((res) => {
                            this.childTextNode = res;
                            if (this.childTextNode?.status === 'OK') {
                                if (this.childTextNode.data.length != 0) {
                                    node.children = this.childTextNode.data;
                                    this.sectctedGroudNode = node.children;
                                    node.expanded = true;
                                    this.structureData = [...this.structureData];
                                    this.projectTranslationService.expandedGroup = this.structureData;
                                    resolve('Node Data recieved');
                                } else {
                                    node.expanded = false;
                                    resolve('Node Data recieved');
                                }
                                this.loading = false;
                            }
                        });
                }
            } else {
                this.loading = false;
                resolve('Node Data recieved');
            }
        });
    }

    loadStructureDataByTableFilter(payload) {
        const props = this.projectTranslationService.getProjectParameters();
        this.loading = true;
        const treeURL = `tree-format/filter-data`;
        this.projectTranslationService
            .getTranslateTreeData(treeURL, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((res) => {
                if (res?.['status'] === 'OK') {
                    this.loading = false;
                    this.structureData = res?.['data'];
                    if (this.currentUser?.role === Roles['editor']) {
                        this.editorLanguageCode = props?.editorLanguageCode.trim();
                    } else if (this.currentUser?.role === Roles['translator']) {
                        this.editorLanguageCode = props?.sourceLangCode.trim();
                    }
                }
            });
    }

    checkNodeType(rows) {
        if (rows.TextNodeId) {
            if (rows?.metatext_info !== Type.MetaText && rows?.text_node_type === Type.MetaText) {
                return tableIcons['user'];
            }
            if (TextnodeType[rows['text_node_type']]) {
                return tableIcons[rows['text_node_type']];
            } else {
                return tableIcons['user'];
            }
        }
    }
    getTextNodeStatus(textNodeStatus) {
        return (
            textNodeStatus === 'Done' ||
            textNodeStatus === 'Work in progress' ||
            textNodeStatus === 'Unworked' ||
            textNodeStatus === 'Pending' ||
            textNodeStatus === 'Approved' ||
            textNodeStatus === 'Rejected' ||
            textNodeStatus === 'Unresolved font' ||
            textNodeStatus === 'Unresolved Chars'
        );
    }

    isTextNodeUnresolved(state: string): boolean {
        return this.getTextNodeStatus(state) && !state.includes('Unresolved');
    }

    getWorstCaseValueByPlaceholder(rowData, parentNode) {
        return this.placeholderService.getTranslationTextWithPlaceholderWorstCaseValue(
            rowData,
            parentNode?.data,
            rowData['translation'],
            'structure'
        )?.translationText;
    }

    getWorstCaseValueByPlaceholderOfTitle(rowData, parentNode) {
        return this.placeholderService.getTranslationTextWithPlaceholderWorstCaseValueTitle(
            rowData,
            parentNode?.data,
            rowData['translation'],
            'structure'
        )?.translationText;
    }

    isUserLoggedInAsProofreader(): boolean {
        return this.currentUser?.role === Roles.proofreader || this.currentUser?.role === Roles.reviewer;
    }

    isContextMenuVisible(): boolean {
        return (
            !this.projectTranslationService.isContextMenuVisible ||
            this.isProofreader ||
            !(
                (this.isReviewer && this.projectTranslationService.isViewGroup(this.selectedTreeNode)) ||
                (!this.isReviewer &&
                    this.projectTranslationService.isTextNodeOrForeignLanguageNode(this.selectedTreeNode))
            ) ||
            this.selectedTreeNode?.['data']?.isReferenceLanguage ||
            this.selectedTreeNode?.data?.text_node_type === Type.MetaText
        );
    }

    isGroupNode(node, property = 'Id') {
        return Object.prototype.hasOwnProperty.call(node, property);
    }

    private initializeRoles() {
        this.isEditor = this.projectTranslationService.getProjectParameters()?.role === Roles.editor;
        this.isProofreader = this.projectTranslationService.getProjectParameters()?.role === Roles.proofreader;
        this.isTranslator = this.projectTranslationService.getProjectParameters()?.role === Roles.translator;
        this.isReviewer = this.projectTranslationService.getProjectParameters()?.role === Roles.reviewer;
    }

    getSelectedTextNodeIndex() {
        return this.selectedTreeNode?.parent?.children.findIndex((item) => item?.data === this.selectedTreeNode?.data);
    }

    getSelectedDoneTreeNodes(data: MetaData, selectedGroup: TreeNode): TreeNode {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return data.data.filterBy
                    ? selectedGroup.children.filter((item) => item?.data?.state !== TranslationStatus.Done)[0]
                    : selectedGroup.children[0];
            }
            case Roles.proofreader: {
                return data.data.filterBy
                    ? selectedGroup.children.filter(
                          (item) =>
                              item?.data?.state === TranslationStatus.Done &&
                              (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                                  this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
                      )[0]
                    : selectedGroup.children[0];
            }
            case Roles.reviewer: {
                return data.data.filterBy
                    ? selectedGroup.children.filter(
                          (item) =>
                              item?.data?.state === TranslationStatus.Done &&
                              this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Pending
                      )[0]
                    : selectedGroup.children[0];
            }
            default: {
                if (data.data.filterBy === NavigationTypes.Exception) {
                    return selectedGroup?.children?.find((item) => item?.data?.isException);
                } else {
                    return data.data.filterBy
                        ? selectedGroup.children.filter(
                              (item) =>
                                  item?.data?.state !== TranslationStatus.Done ||
                                  this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Rejected ||
                                  this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected
                          )[0]
                        : selectedGroup.children[0];
                }
            }
        }
    }

    getSelectedGroupDoneOrUnfinishedNode(data: MetaData, selectedGroup: TreeNode): TreeNode {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return selectedGroup?.parent?.children?.find(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data?.data?.filterBy || data?.data?.state !== TranslationStatus.Done)
                );
            }
            case Roles.proofreader: {
                return selectedGroup?.parent?.children?.find(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data?.data?.filterBy ||
                            (data?.data?.state === TranslationStatus.Done &&
                                (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                                    this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)))
                );
            }
            default: {
                if (data.data.filterBy === NavigationTypes.Exception) {
                    return selectedGroup?.parent?.children?.find(
                        (item) => item?.data?.['TextNodeId'] && item?.data?.isException
                    );
                } else {
                    return selectedGroup?.parent?.children?.find(
                        (item) =>
                            item?.data?.['TextNodeId'] &&
                            (!data?.data?.filterBy ||
                                data?.data?.state !== TranslationStatus.Done ||
                                this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected ||
                                this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
                    );
                }
            }
        }
    }

    getAllTextNode(data: MetaData, selectedGroup: TreeNode): TreeNode[] {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return selectedGroup?.parent?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data?.data?.filterBy || item?.data?.state !== TranslationStatus.Done)
                );
            }
            case Roles.proofreader: {
                return selectedGroup?.parent?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data?.data?.filterBy ||
                            (item?.data?.state === TranslationStatus.Done &&
                                (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                                    this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)))
                );
            }
            case Roles.reviewer: {
                return selectedGroup?.parent?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data?.data?.filterBy ||
                            (item?.data?.state === TranslationStatus.Done &&
                                this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Pending))
                );
            }
            default: {
                if (data.data.filterBy === NavigationTypes.Exception) {
                    return selectedGroup?.parent?.children?.filter((item) => item?.data?.isException);
                } else {
                    return selectedGroup?.parent?.children?.filter(
                        (item) =>
                            item?.data?.['TextNodeId'] &&
                            (!data?.data?.filterBy ||
                                item?.data?.state !== TranslationStatus.Done ||
                                this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Rejected ||
                                this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
                    );
                }
            }
        }
    }

    getAllChildGroup(selectedGroup: TreeNode, data: MetaData): TreeNode[] {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return selectedGroup?.parent?.children?.filter(
                    (item) =>
                        item.data?.['Id'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Unfinished &&
                                item?.data?.nodeCount > item?.data?.doneCount))
                );
            }
            case Roles.proofreader: {
                return selectedGroup?.parent?.children?.filter(
                    (item) =>
                        item.data?.['Id'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Proofread &&
                                item?.data?.doneCount > 0 &&
                                (item?.data?.doneCount >
                                    item?.data?.proofreadApprovedCount + item?.data?.proofreadRejectedCount ||
                                    item?.data?.reviewRejectedCount > 0)))
                );
            }
            case Roles.reviewer: {
                const group = selectedGroup?.parent ?? selectedGroup;
                return group?.children?.filter(
                    (item) =>
                        item.data?.['Id'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Reviewer &&
                                ((this.projectTranslationService.getProjectParameters().reviewType ===
                                    ReviewTypes.Standard &&
                                    item?.data?.doneCount >
                                        item?.data?.reviewApprovedCount + item?.data?.reviewRejectedCount) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        item?.data?.doneCount >
                                            item?.data?.screenReviewApprovedCount +
                                                item?.data?.screenReviewRejectedCount))))
                );
            }
            default: {
                if (!data.data.filterBy || data.data.filterBy === NavigationTypes.Exception) {
                    return selectedGroup?.parent?.children?.filter(
                        (item) => item.data?.['Id'] && item?.data?.isExceptionNodesAvailable
                    );
                } else {
                    return selectedGroup?.parent?.children?.filter(
                        (item) =>
                            item.data?.['Id'] &&
                            (!data.data.filterBy ||
                                (data.data.filterBy === NavigationTypes.Unfinished &&
                                    (item?.data?.nodeCount > item?.data?.doneCount ||
                                        item?.data?.proofreadRejectedCount > 0 ||
                                        item?.data?.reviewRejectedCount > 0)) ||
                                (data.data.filterBy === NavigationTypes.Exception &&
                                    item?.data?.isExceptionNodesAvailable))
                    );
                }
            }
        }
    }

    getChildrenAllTextNode(selectedGroup: TreeNode, data: MetaData): TreeNode[] {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Unfinished &&
                                item?.data?.state !== TranslationStatus.Done))
                );
            }

            case Roles.proofreader: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Proofread &&
                                item?.data?.state === TranslationStatus.Done &&
                                (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                                    this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)))
                );
            }
            case Roles.reviewer: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['TextNodeId'] &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Reviewer &&
                                ((this.projectTranslationService.getProjectParameters().reviewType ===
                                    ReviewTypes.Standard &&
                                    item?.data?.state === TranslationStatus.Done &&
                                    this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Pending) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        item?.data?.state === TranslationStatus.Done &&
                                        this.textnodeStatus[item?.data?.screen_review_status] ===
                                            TranslationStatus.Pending))))
                );
            }
            default: {
                if (data.data.filterBy === NavigationTypes.Exception) {
                    return selectedGroup?.children?.filter((item) => item?.data?.isException);
                } else {
                    return selectedGroup?.children?.filter(
                        (item) =>
                            (item?.data?.['TextNodeId'] && !data.data.filterBy) ||
                            item?.data?.state !== TranslationStatus.Done ||
                            this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Rejected ||
                            this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected
                    );
                }
            }
        }
    }

    getAllChildGroupNode(selectedGroup: TreeNode, data: MetaData): TreeNode[] {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['Id'] &&
                        item?.data?.nodeCount > 0 &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Unfinished &&
                                item?.data?.nodeCount > item?.data?.doneCount))
                );
            }
            case Roles.proofreader: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['Id'] &&
                        item?.data?.nodeCount > 0 &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Proofread &&
                                item?.data?.doneCount > 0 &&
                                (item?.data?.doneCount >
                                    item?.data?.proofreadApprovedCount + item?.data?.proofreadRejectedCount ||
                                    item?.data?.reviewRejectedCount > 0)))
                );
            }
            case Roles.reviewer: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['Id'] &&
                        item?.data?.nodeCount > 0 &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Reviewer &&
                                ((this.projectTranslationService.getProjectParameters().reviewType ===
                                    ReviewTypes.Standard &&
                                    item?.data?.doneCount >
                                        item?.data?.reviewApprovedCount + item?.data?.reviewRejectedCount) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        item?.data?.doneCount >
                                            item?.data?.screenReviewApprovedCount +
                                                item?.data?.screenReviewRejectedCount))))
                );
            }
            default: {
                return selectedGroup?.children?.filter(
                    (item) =>
                        item?.data?.['Id'] &&
                        item?.data?.nodeCount > 0 &&
                        (!data.data.filterBy ||
                            (data.data.filterBy === NavigationTypes.Unfinished &&
                                (item?.data?.nodeCount > item?.data?.doneCount ||
                                    item?.data?.proofreadRejectedCount > 0 ||
                                    item?.data?.reviewRejectedCount > 0)) ||
                            (data.data.filterBy === NavigationTypes.Exception && item?.data?.isExceptionNodesAvailable))
                );
            }
        }
    }

    getAllTextNodeForToFirstAndToLast(data: MetaData, selectedGroup: TreeNode): TreeNode[] {
        if (this.isProofreader && data?.data?.filterBy === NavigationTypes.Proofread) {
            return selectedGroup?.children?.filter(
                (item) =>
                    item?.data?.['TextNodeId'] &&
                    item?.data?.state === TranslationStatus.Done &&
                    (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                        this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
            );
        } else if (
            this.isReviewer &&
            data?.data?.filterBy === NavigationTypes.Reviewer &&
            this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Standard
        ) {
            return selectedGroup?.children?.filter(
                (item) =>
                    item?.data?.['TextNodeId'] &&
                    item?.data?.state === TranslationStatus.Done &&
                    this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Pending
            );
        } else if (
            this.isReviewer &&
            data?.data?.filterBy === NavigationTypes.View &&
            this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Screen
        ) {
            return selectedGroup?.children?.filter(
                (item) =>
                    item?.data?.['TextNodeId'] &&
                    item?.data?.state === TranslationStatus.Done &&
                    this.textnodeStatus[item?.data?.screen_review_status] === TranslationStatus.Pending
            );
        } else if (this.isTranslator && data?.data?.filterBy === NavigationTypes.Unfinished) {
            return selectedGroup?.children?.filter(
                (item) =>
                    item?.data?.['TextNodeId'] &&
                    (item?.data?.state !== TranslationStatus.Done ||
                        this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Rejected ||
                        this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
            );
        } else if (this.isTranslator && data?.data?.filterBy === NavigationTypes.Exception) {
            return selectedGroup?.children?.filter((item) => item?.data?.['TextNodeId'] && item?.data?.isException);
        } else {
            return selectedGroup?.children?.filter(
                (item) =>
                    item?.data?.['TextNodeId'] &&
                    (!data.data.filterBy || (data.data.filterBy && item?.data?.state !== TranslationStatus.Done))
            );
        }
    }

    isTextnodeContainsError() {
        return (
            !this.projectTranslationService.isLengthError ||
            !this.projectTranslationService.fontIsUnresloved ||
            !this.projectTranslationService.hasUnresolvedCharacters
        );
    }

    getTreeDataApiRequestPayload(
        lang,
        props: any,
        groupId?: string,
        urlType?: string,
        mainView?: string,
        view?: string
    ) {
        const payload: TranslationChildNodeRequestModel | TranslationTreeNodeRequestModel = {
            project_id: props?.projectId,
            version_id: props?.version,
            role: Roles[this.currentUser?.role],
            start_row: null,
            end_row: null,
            translation_request_id: props?.translationRequestId,
            node_id: groupId,
            lang: lang?.['code'],
        };

        if (this.currentUser?.role === Roles.reviewer) {
            payload.reviewType = props?.reviewType;
            if (urlType === 'child-data') {
                payload.variantName = view;
                payload.viewName = mainView ? mainView : view;
            }
        }
        return payload;
    }

    isTooltipVisible(rowData, status: string): boolean {
        return rowData[status] !== TextNodeStatus.Rejected;
    }

    getComments(rowData, role: number) {
        switch (role) {
            case Roles.proofreader:
                return rowData['proofread_comment'];
            case Roles.reviewer:
                return rowData['review_comment'];
            default:
                return '-';
        }
    }
    getAvailableTextNodeForNavigationInGroup(action): TreeNode[] {
        const selectedTextNodeIndex = this.getSelectedTextNodeIndex();
        return action === 'next'
            ? this.selectedTreeNode?.parent?.children?.slice(selectedTextNodeIndex + 1)
            : this.selectedTreeNode?.parent?.children?.slice(0, selectedTextNodeIndex);
    }
    selectTreeNode() {
        this.getRowOnClick({ node: this.selectedTreeNode });
        this.projectTranslationService.ScrollToSelectedItem(this.mtree, 'translationtree');
        this.structureData = [...this.structureData];
    }

    getRoleWiseTextNodeData(action: string, filterBy: string) {
        switch (this.currentUser?.role) {
            case Roles.editor: {
                return this.getAvailableTextNodeForNavigationInGroup(action)?.filter(
                    (item) => item?.data?.state !== TranslationStatus.Done
                );
            }
            case Roles.proofreader: {
                return this.getAvailableTextNodeForNavigationInGroup(action)?.filter(
                    (item) =>
                        item?.data?.state === TranslationStatus.Done &&
                        (this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Pending ||
                            this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected)
                );
            }
            case Roles.reviewer: {
                return this.getAvailableTextNodeForNavigationInGroup(action)?.filter(
                    (item) =>
                        item?.data?.state === TranslationStatus.Done &&
                        this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Pending
                );
            }
            default: {
                if (filterBy === NavigationTypes.Exception) {
                    return this.getAvailableTextNodeForNavigationInGroup(action)?.filter(
                        (item) => item?.data?.isException
                    );
                } else {
                    return this.getAvailableTextNodeForNavigationInGroup(action)?.filter(
                        (item) =>
                            item?.data?.state !== TranslationStatus.Done ||
                            this.textnodeStatus[item?.data?.proofread_status] === TranslationStatus.Rejected ||
                            this.textnodeStatus[item?.data?.review_status] === TranslationStatus.Rejected
                    );
                }
            }
        }
    }

    getUserDefinedIcon(node: TreeNode): string {
        return this.isGroupNode(node?.data) ? 'icon-userdefined' : '';
    }

    private getSelectedTreeNode() {
        return this.selectedTreeNode?.['children'] || !!this.getSelectedTreeNodeForUsers()
            ? this.selectedTreeNode
            : this.selectedTreeNode['parent'];
    }

    private getSelectedTreeNodeForUsers() {
        switch (this.currentUser?.role) {
            case Roles.translator:
            case Roles.proofreader:
            case Roles.reviewer:
                return this.selectedTreeNode?.['data'];
        }
    }
    rowTrackBy(index: number, row: any) {
        const data = row.node.data;
        return data.Id || data.TextNodeId || data.ID || data.context;
    }

    isRoleWiseShowColumn() {
        switch (this.currentUser?.role) {
            case Roles.translator:
            case Roles.editor:
            case Roles.reviewer:
                return true;
            default:
                return false;
        }
    }

    async viewNavigation(data: any) {
        let currentNode: TreeNode = this.selectedTreeNode;
        let selectedTextNode = null;
        let viewName = null;
        if (!currentNode) {
            this.selectedTreeNode = this.getFirstViewFirstTextNode();
            this.selectTreeNode();
            this.structureData = [...this.structureData];
        } else {
            do {
                if (currentNode?.data?.Type === NodeLevelType.View) {
                    const currentNodeIndex = this.structureData.findIndex(
                        (viewItem) => viewItem?.data?.Id === currentNode.data.Id
                    );
                    if (this.isNotLastAndFirstView(currentNodeIndex, data)) {
                        currentNode = this.getNextOrPreviousView(currentNodeIndex, data);
                    } else {
                        currentNode = this.getFirstOrLastView(data);
                    }
                    viewName = currentNode?.data?.context;
                    currentNode = this.getVariantNode(currentNode);
                    currentNode.expanded = true;
                    this.structureData = [...this.structureData];
                    await this.onNodeExpand({ node: currentNode, viewName: viewName }).then(() => {
                        selectedTextNode = currentNode?.children[0];
                        this.selectedTreeNode = selectedTextNode;
                        this.selectTreeNode();
                        this.structureData = [...this.structureData];
                    });
                } else {
                    currentNode = currentNode?.parent;
                }
            } while (!selectedTextNode);
        }
    }

    private getFirstViewFirstTextNode(): TreeNode {
        this.selectedTreeNode = this.structureData[0];
        this.selectedTreeNode.expanded = true;
        this.structureData = [...this.structureData];
        this.selectedTreeNode = this.selectedTreeNode.children[0];
        this.selectedTreeNode.expanded = true;
        this.structureData = [...this.structureData];
        return this.selectedTreeNode.children[0];
    }
    private getNextOrPreviousView(currentNodeIndex: number, data: MetaData): TreeNode {
        return data.data.action === Direction.Next
            ? this.structureData[currentNodeIndex + 1]
            : this.structureData[currentNodeIndex - 1];
    }

    private getFirstOrLastView(data: MetaData): TreeNode {
        return data.data.action === Direction.Next
            ? this.structureData[0]
            : this.structureData[this.structureData.length - 1];
    }

    private getVariantNode(node: TreeNode): TreeNode {
        node.expanded = true;
        this.structureData = [...this.structureData];
        return node?.children[0];
    }

    private isNotLastAndFirstView(currentNodeIndex: number, data: MetaData): boolean {
        return (
            (currentNodeIndex < this.structureData.length - 1 && data.data.action === Direction.Next) ||
            (currentNodeIndex > 0 && data.data.action === Direction.Previous)
        );
    }

    private navigateToInheritanceLanguage(data): void {
        const selectedLanguageParentIndex = data.data.selectedNode.parent.children.findIndex(
            (item) => item.data.TextNodeId === data.data.selectedNode.data.TextNodeId
        );
        if (selectedLanguageParentIndex > -1) {
            data.data.selectedNode.parent.children[selectedLanguageParentIndex].expanded = true;
            this.structureData = [...this.structureData];
        }
    }

    private findInheritanceTextNode(data) {
        return (
            data.data.selectedNode.parent.children.find((item) => item.data.context === data.data.context) ??
            data.data.selectedNode.children.find((item) => item.data.context === data.data.context)
        );
    }

    private navigateAndSelectNode(): void {
        this.eventBus
            .on('structure:onLanguageSelect')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(async (data: MetaData) => {
                const languageWiseSelectedTextNode = this.findInheritanceTextNode(data);
                const row = { node: languageWiseSelectedTextNode };
                this.getRowOnClick(row);
                this.selectedTreeNode = languageWiseSelectedTextNode;
                this.navigateToInheritanceLanguage(data);
            });
    }
}
