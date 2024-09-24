import { Component, OnInit } from '@angular/core';
import { IgcDockManagerComponent, IgcPaneCloseEventArgs } from 'igniteui-dockmanager';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Direction, NavigationTypes, NavigationTypesDisplayName, Roles } from 'src/Enumerations';
import { LayoutconfigurationService } from 'src/app/core/services/layoutConfiguration/layoutconfiguration.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { LayoutConfigurationComponent } from '../layout-configuration/layout-configuration.component';
import { LockUnlockViewComponent } from '../lock-unlock-view/lock-unlock-view.component';
import { ReviewTypes } from '../review-types';
import { NavigationType as NavigationOptions } from './navigation-type.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-header-translation',
    templateUrl: './header-translation.component.html',
    styleUrls: ['./header-translation.component.scss'],
})
export class HeaderTranslationComponent implements OnInit {
    igniteMenu: MenuItem[];
    dockManager: IgcDockManagerComponent;
    projectNameWithVersion: string;
    isPasteWarningDisplay: boolean;
    role: Roles;
    isEditor: boolean;
    isTranslator: boolean;
    isProofreader: boolean;
    isReviewer: boolean;
    previousButtonTooltip = 'Previous unfinished';
    nextButtonTooltip = 'Next unfinished';
    defaultNavigationOptions: NavigationOptions[] = [
        this.getNavigationMenu(NavigationTypesDisplayName.TextNode, NavigationTypes.TextNode, 1),
    ];
    navigationOptions: NavigationOptions[] = this.defaultNavigationOptions;
    selectedNavigationType: NavigationOptions = this.navigationOptions[0];
    direction = Direction;
    destroyed$ = new Subject<boolean>();
    isReferenceLanguage = false;

    constructor(
        private configurationService: LayoutconfigurationService,
        private projectTranslationService: ProjectTranslationService,
        private eventBus: NgEventBus,
        private dialogService: DialogService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.projectNameWithVersion = this.getProjectNameWithVersion();
        this.role = this.projectTranslationService.getProjectParameters()?.role;
        this.initializeDocManager();
        this.viewList();
        this.initializeRoles();
        this.previousButtonTooltip = this.isProofreader ? 'Previous done' : 'Previous unfinished';
        this.nextButtonTooltip = this.isProofreader ? 'Next done' : 'Next unfinished';
        this.navigationOptions = this.getNavigationOptions(this.role).sort(
            (firstItem, secondItem) => firstItem.sequence - secondItem.sequence
        );
        this.eventBus
            .on('translateData:translateObj')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: MetaData) => {
                this.isReferenceLanguage = response.data?.treeNode?.data?.isReferenceLanguage;
            });
    }

    displayLockUnlockDialog() {
        const dialogConfig: DynamicDialogConfig = {
            header: `Lock / Unlock Text`,
            footer: ' ',
            autoZIndex: false,
            closeOnEscape: false,
            width: '60%',
            styleClass: 'project-properties',
            draggable: true,
        };

        if (this.role === Roles.editor) {
            if (
                (this.projectTranslationService.selectedRow &&
                    this.projectTranslationService.selectedRow?.['children']?.length > 0) ||
                this.projectTranslationService.translationSourceType === 'Table'
            ) {
                if (this.projectTranslationService.translationSourceType !== 'Table') {
                    this.projectTranslationService.lockUnlockTextNode();
                }
                this.dialogService.open(LockUnlockViewComponent, dialogConfig);
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Lock/Unlock text',
                    detail: 'Please select text node!',
                });
            }
        } else if (this.role === Roles.translator) {
            this.dialogService.open(LockUnlockViewComponent, dialogConfig);
        }
    }

    private viewList() {
        this.igniteMenu = [
            {
                label: `Translation`,
                icon: `${this.setCheckPaneExit('translationid') ? 'pi pi-check' : 'pi  pi-times'}`,
            },
            {
                label: `Structure`,
                icon: `${this.setCheckPaneExit('structure') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('structure');
                },
            },
            {
                label: `Table`,
                icon: `${this.setCheckPaneExit('table') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('table');
                },
            },
            {
                label: `Properties`,
                icon: `${this.setCheckPaneExit('properties') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('properties');
                },
            },
            {
                label: `Translation Memory`,
                icon: `${this.setCheckPaneExit('translationmemory') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('translationmemory');
                },
            },
            {
                label: `Menugraphics`,
                icon: `${this.setCheckPaneExit('menugraphics') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('menugraphics');
                },
            },
            {
                label: `Dependencies`,
                icon: `${this.setCheckPaneExit('dependencies') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('dependencies');
                },
            },
            {
                label: `Unicode`,
                icon: `${this.setCheckPaneExit('unicode') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('unicode');
                },
            },
            {
                label: `Textnode History`,
                icon: `${this.setCheckPaneExit('texthistory') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('texthistory');
                },
            },
            {
                label: `Translation History`,
                icon: `${this.setCheckPaneExit('translationhistory') ? 'pi pi-check' : 'pi  pi-times'}`,
                command: () => {
                    this.checkDataExit('translationhistory');
                },
            },
        ];

        if (this.role == Roles.editor) {
            this.igniteMenu.push(this.getEditorConfig());
        }
    }

    copyNode() {
        this.projectTranslationService.copySelectedLanguage(
            this.projectTranslationService?.selectedRow,
            this.projectTranslationService?.translationSourceType
        );
    }

    pasteNode() {
        this.projectTranslationService.onPaste();
        this.isPasteWarningDisplay = this.projectTranslationService.openCopyAndPasteDialog;
    }

    confirmToClose() {
        this.isPasteWarningDisplay = false;
        this.projectTranslationService.openCopyAndPasteDialog = false;
    }

    get isTextNodeLockedOrLengthError() {
        return (
            this.projectTranslationService.isTextnodeLocked ||
            this.projectTranslationService.isLengthError ||
            this.projectTranslationService.hasUnresolvedCharacters
        );
    }

    changeStatus(status: string) {
        this.projectTranslationService.changeState(status);
    }

    navigation(actionType, filterBy = '') {
        const data = { action: actionType, filterBy: filterBy };
        if (this.projectTranslationService.translationSourceType === 'Table') {
            this.eventBus.cast('table:navigation', data);
        } else {
            this.eventBus.cast('structure:navigation', data);
        }
    }

    displayLayoutConfigDialog() {
        this.configurationService.layoutDialog = this.dialogService.open(LayoutConfigurationComponent, {
            header: `Layout Configuration`,
            footer: ' ',
            autoZIndex: false,
            closeOnEscape: false,
            width: '50%',
            styleClass: 'project-properties',
            draggable: true,
            closable: false,
        });
    }

    private initializeDocManager() {
        this.dockManager = this.configurationService.getDocManagerLayout();
        this.dockManager.addEventListener('paneClose', (ev: CustomEvent<IgcPaneCloseEventArgs>) => {
            this.handlePaneClose(ev);
        });
    }

    private getProjectNameWithVersion() {
        const parameters = this.projectTranslationService.getProjectParameters();
        return parameters && `${parameters.projectName} (V.${parameters.version.toString().split('.')[1]})`;
    }

    private handlePaneClose(ev: CustomEvent<IgcPaneCloseEventArgs>) {
        this.checkDataExit(ev.detail.panes[0]['contentId']);
    }

    private setCheckPaneExit(title: string) {
        return this.configurationService.setIconContextMenu(title, this.dockManager.layout);
    }

    private checkDataExit(title: string) {
        this.dockManager.layout = this.configurationService.setLayoutOnChange(title, this.dockManager.layout);
        this.viewList();
    }

    private initializeRoles() {
        this.isEditor = this.projectTranslationService.getProjectParameters()?.role === Roles.editor;
        this.isProofreader = this.projectTranslationService.getProjectParameters()?.role === Roles.proofreader;
        this.isTranslator = this.projectTranslationService.getProjectParameters()?.role === Roles.translator;
        this.isReviewer = this.projectTranslationService.getProjectParameters()?.role === Roles.reviewer;
    }

    private getEditorConfig() {
        return {
            label: 'Mapping Proposals',
            icon: this.setCheckPaneExit('mappingproposals') ? 'pi pi-check' : 'pi  pi-times',
            command: () => {
                this.checkDataExit('mappingproposals');
            },
        };
    }

    getNavigationOptions(role: Roles) {
        switch (role) {
            case Roles.editor: {
                return [
                    ...this.defaultNavigationOptions,
                    this.getNavigationMenu(NavigationTypesDisplayName.Unfinished, NavigationTypes.Unfinished, 2),
                ];
            }
            case Roles.translator: {
                return [
                    ...this.defaultNavigationOptions,
                    this.getNavigationMenu(NavigationTypesDisplayName.Unfinished, NavigationTypes.Unfinished, 2),
                    this.getNavigationMenu(NavigationTypesDisplayName.Exception, NavigationTypes.Exception, 3),
                ];
            }

            case Roles.proofreader: {
                return [
                    ...this.defaultNavigationOptions,
                    this.getNavigationMenu(NavigationTypesDisplayName.Proofread, NavigationTypes.Proofread, 2),
                ];
            }
            case Roles.reviewer: {
                const reviewType = this.projectTranslationService.getProjectParameters()?.reviewType;
                const navigationOptions = [
                    ...this.defaultNavigationOptions,
                    this.getNavigationMenu(NavigationTypesDisplayName.Reviewer, NavigationTypes.Reviewer, 2),
                ];

                if (reviewType === ReviewTypes.Screen) {
                    this.getNavigationMenu(NavigationTypesDisplayName.View, NavigationTypes.View, 2);
                }
                return navigationOptions;
            }
            default: {
                return this.defaultNavigationOptions;
            }
        }
    }

    navigate(direction: Direction) {
        switch (this.selectedNavigationType.type) {
            case NavigationTypes.TextNode: {
                this.navigation(direction);
                break;
            }
            case NavigationTypes.Unfinished: {
                this.navigation(direction, NavigationTypes.Unfinished);
                break;
            }
            case NavigationTypes.Proofread: {
                this.navigation(direction, NavigationTypes.Proofread);
                break;
            }
            case NavigationTypes.Reviewer: {
                this.navigation(direction, NavigationTypes.Reviewer);
                break;
            }
            case NavigationTypes.View: {
                this.navigation(direction, NavigationTypes.View);
                break;
            }
            case NavigationTypes.Exception: {
                this.navigation(direction, NavigationTypes.Exception);
                break;
            }
            default: {
                const defaultDirection = direction === Direction.Previous ? Direction.ToFirst : Direction.ToLast;
                this.navigation(defaultDirection);
                break;
            }
        }
    }

    private getNavigationMenu(displayName: NavigationTypesDisplayName, type: NavigationTypes, sequence: number) {
        return {
            displayName: displayName,
            type: type,
            sequence: sequence,
        };
    }
}
