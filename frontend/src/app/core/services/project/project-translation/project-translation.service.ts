import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BehaviorSubject, Observable, Subject, catchError, of } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import {
    NodeLevelType,
    OverlayHeaders,
    ResponseStatusEnum,
    Roles,
    TextNodeStatus,
    TextState,
    TranslationRoleEnum,
    TranslationStatus,
    TranslationViewType,
} from 'src/Enumerations';
import { LabelModel } from 'src/app/components/dashboard/label-manager/label.model';
import { CommentsModel } from 'src/app/components/project/project-traslation-new/comments/comments.model';
import { PlaceholderDataTypeEnum } from 'src/app/components/project/project-traslation-new/placeholder-detail-dialog/placeholder-data-type.enum';
import { ProjectTranslationData } from 'src/app/components/project/project-traslation-new/project-translation-data';
import {
    LineBreakMode,
    RichEditorOptions,
} from 'src/app/components/project/project-traslation-new/text-editor/rich-text-editor/rich-text-editor.model';
import { OverlayPanelComponent } from 'src/app/shared/components/overlay-panel/overlay-panel.component';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ConsistencyCheckRequestModel } from 'src/app/shared/models/check/consistency-check-model.model';
import { LabelCheckModel } from 'src/app/shared/models/check/label-check-model.model';
import { TranslationCheckType } from 'src/app/shared/models/check/transaltion-check.enum';
import { TranslationCheckConfigModel } from 'src/app/shared/models/check/translation-check.model';
import { LabelOperations } from 'src/app/shared/models/labels/label-operations.model';
import {
    CalculateWordLineBreakPayload,
    ProjectLengthCalculation,
    SelectedTextNodeChildLanguages,
} from 'src/app/shared/models/project/projectTranslate';
import { environment } from 'src/environments/environment';
import { ApiService } from '../../api.service';
import { TranslationCheckService } from '../../check/translation-check.service';
import { LabelsService } from '../../labels/labels.service';
import { MappingService } from '../../mapping/mapping.service';
import { LocalStorageService } from '../../storage/local-storage.service';
import { UserService } from '../../user/user.service';
import { ProjectService } from '../project.service';
import { CommentsDialogService } from './comments-dialog.service';
import { CommentsService } from './comments.service';
import { PlaceholderService } from './placeholder.service';
import { ReviewerTranslationService } from './reviewer-translation.service';
import { StcDetailsService } from './stc-details.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectTranslationService {
    readonlyEditorOptions: RichEditorOptions = {
        readonly: true,
    };
    activeEditorOptions: RichEditorOptions = {
        spellchecking: true,
        spaces: true,
        readonly: true,
        findTerms: true,
    };
    translateState = new BehaviorSubject<any>({});
    treeActionItems: MenuItem[];
    projectProps: object;
    selectedRow: object;
    displayChangeStateDialog = false;
    traslateStatus: string;
    translateWarning: string;
    state: string;
    lengthCalculation = 0;
    maxWidth = 0;
    multipleLock: any = [];
    checkedLockedValue: any[] = [];
    isTextWarningVisible = false;
    lockedStatus: string;
    forStatusChangebject;
    langTabelProps;
    translationSourceType = 'structure';
    selectedLanguageCode: string;
    isTextLocked: boolean;
    displayEditorConfirmDialog = false;
    isAcceptedByEditor = false;
    translationText = '';
    confirmationService;
    messageService;
    changedBy;
    lastChange;
    lastTranslationText = '';
    isUndoPressed = false;
    isLengthError = false;
    isSpeechEditorVisible = false;
    isMetaEditorVisible = false;
    resolvedTextflag = false;
    resolvedTextflagExpand = false;
    isPromptEditorVisible = false;
    copyTableRow;
    openConfirmDialog = false;
    openCopyAndPasteDialog = false;
    allParentGroup: TreeNode[] = [];
    pasteTableRow;
    isTextnodeLocked = false;
    progressBarWidth = 0;
    oldTranslationText: string;
    isSaveButtonDisabled = true;
    totalTextNode: number;
    oldSelectedRow: TreeNode = {};
    isContextMenuVisible = true;
    isWorkInProgressDisabled = true;
    tableSelectedRow = undefined;
    structureSelectedRow: TreeNode = undefined;
    widthByFont: number;
    lineBreakMode: LineBreakMode = 'Manual';
    lengthCalculatorId;
    fontFileId;
    fontName = 'FreeSans';
    fontSize = 12;
    fontType = '';
    unresolvedSymbols: string[] = [];
    hasUnresolvedCharacters = false;
    position: number[] = [];
    linesWidth: number[] = [];
    openUnresolvedCharactersModel = false;
    fontIsUnresloved = false;
    maxCharacters = 0;
    maxRow = 0;
    translationRole = 1;
    isSaveNext = false;
    translationRoleEnum = TranslationRoleEnum;
    translationViewType = TranslationViewType;
    textState = TextState;
    calculateWidthByLengthCalculation = 0;
    textChanged = false;
    textNodeErrors = [];
    statusNotAvailable = 'N/A';
    selectedNodes: TreeNode[] = [];
    isMultipleLanguagesForLengthCalculation = false;
    filterAppliedInStructure = true;
    private readonly _calculateLengthRequiredParms$ = new BehaviorSubject<CalculateWordLineBreakPayload>({});
    readonly calculateLengthRequiredParms$ = this._calculateLengthRequiredParms$.asObservable();
    private socket$: WebSocketSubject<any>;
    filterRemovedInTable = new Subject<boolean>();
    placeholderDataTypeEnum = PlaceholderDataTypeEnum;
    projectData: ProjectTranslationData;
    languageGroup = [];
    textNodeSaved = false;
    statusConfirmedInPopup = false;
    lengthCalculationWidth: number;
    config: TranslationCheckConfigModel;
    translationTexts: string[] = [];
    isTranslationCheckError = false;
    oldTranslationState = '';
    treeNode: TreeNode;
    isException: true;
    languageParentId: 0;
    expandedGroup: TreeNode[] = [];
    tableValue = [];

    private translationTextState = new BehaviorSubject('');
    translationTextState$ = this.translationTextState.asObservable();

    readonly LCServerPath = environment.fontUploadPath;

    constructor(
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly eventBus: NgEventBus,
        private readonly projectService: ProjectService,
        private readonly stcDetailsService: StcDetailsService,
        private readonly mappingService: MappingService,
        private readonly datePipe: DatePipe,
        private readonly confirmService: ConfirmationService,
        private readonly localStorageService: LocalStorageService,
        private readonly placeholderService: PlaceholderService,
        private readonly commentService: CommentsService,
        private readonly commentsDialogService: CommentsDialogService,
        private readonly labelService: LabelsService,
        private readonly translationCheckService: TranslationCheckService,
        private readonly dialogService: DialogService,
        private readonly reviewerTranslationService: ReviewerTranslationService
    ) {
        this.eventBus.on('texteditor:primengservises').subscribe({
            next: (res: any) => {
                this.confirmationService = res?.data?.confirmationService;
                this.messageService = res?.data?.messageService;
            },
        });
        this.socket$ = new WebSocketSubject(environment.lcWsUrl);
        this.socketSubscription();
    }
    get role(): string {
        const currentUser = this.getLoggedInUserInformation();
        return Roles[currentUser?.role];
    }
    get getCalculateLengthRequiredParms(): CalculateWordLineBreakPayload {
        return this._calculateLengthRequiredParms$.getValue();
    }
    set setCalculateLengthRequiredParms(val: CalculateWordLineBreakPayload) {
        this._calculateLengthRequiredParms$.next(val);
    }
    getTranslateTableData(url: any, id: any) {
        return this.apiService.postTypeRequest(url, id);
    }

    getTranslateTreeData(url: any, id: any) {
        return this.apiService.postTypeRequest(url, id);
    }

    setTranslationSate(data) {
        this.translateState.next(data);
    }
    getTranslationState(): Observable<any> {
        return this.translateState.asObservable();
    }

    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }
    getLoggedInUserInformation() {
        if (localStorage.getItem('currentUser')) {
            const value = localStorage.getItem('currentUser');
            return JSON.parse(value);
        }
    }

    getSelectedRow(row, text, Type = 'structure', selectedLang?, selectedLangHeader?) {
        this.selectedNodes = [];
        this.isContextMenuVisible = true;
        this.isTranslationCheckError = false;
        this.placeholderService.placeholderDynamicValues = [];
        if (this.isTextNodelatestOrModified(row, Type)) {
            this.isContextMenuVisible = false;
            // show popup
            this.confirmService.confirm({
                message: `There are some unsaved changes, Any changes that have not been saved will be lost if you proceed. Do you want to save your changes before proceeding?`,
                accept: async () => {
                    //Actual logic to perform a confirmation
                    this.isSaveButtonDisabled = true;
                    this.textChanged = false;
                    this.statusConfirmedInPopup = true;
                    if (this.stcDetailsService.headerIdealText.includes('Ideal')) {
                        this.stcDetailsService.headerIdealText = 'Ideal Text';
                    } else {
                        this.stcDetailsService.headerIdealText = 'Short Form';
                    }

                    if (Type !== 'structure') {
                        await this.changeState(this.textNodeState, 0, false, true);
                    } else {
                        await this.changeState(this.selectedRow['data'].state, 0, false, true);
                        this.tabletranslationText(this.translationText, selectedLang);
                    }

                    this.getSelectedRow(row, text, Type, selectedLang, selectedLangHeader);
                    this.activeEditorOptions.readonly = false;
                },
                reject: () => {
                    this.isSaveButtonDisabled = true;
                    this.textChanged = false;
                    this.statusConfirmedInPopup = false;
                    if (Type !== 'structure') {
                        this.tabletranslationText(this.oldTranslationText, selectedLang);
                    } else {
                        Object.assign(this.selectedRow?.['data'], this.oldSelectedRow);
                        this.inheritParentPropertiesToChildLanguages(this.oldSelectedRow?.['state']);
                    }
                    this.projectTranslationData = null;
                    this.getSelectedRow(row, text, Type, selectedLang, selectedLangHeader);
                    this.isLengthError = false;
                },
            });
        } else {
            if (
                row?.data?.TextNodeId !== this.oldSelectedRow?.['TextNodeId'] ||
                row?.data?.ID !== this.oldSelectedRow?.['ID'] ||
                row?.text_node_id !== this.oldSelectedRow?.['text_node_id'] ||
                row?.ID !== this.oldSelectedRow?.['ID']
            )
                this.isSaveButtonDisabled = true;

            this.oldSelectedRow = {};
            this.state = this.textNodeState;
            if (Type !== 'structure') {
                Object.assign(this.oldSelectedRow, row || {});
            } else {
                Object.assign(this.oldSelectedRow, row?.data || {});
            }
            this.selectedRow = row;
            this.selectedNodes.push(row);
            this.isWorkInProgressDisabled = row?.data?.state !== 'Done';
            this.isUndoPressed = false;

            if (Type !== 'structure') {
                const tableText = row['language_data']
                    .find((item) => item.language_code === selectedLang)
                    .language_props.find((lang) => lang?.prop_name === 'Text').value;
                this.translationText = tableText;
                this.oldTranslationText = tableText;
            } else {
                this.translationText = this.selectedRow?.['data']?.translation ?? '';
                this.oldTranslationText = this.selectedRow?.['data']?.translation ?? '';
            }
            this.isPromptEditorVisible =
                this.getTextNodeType() === 'SdsPrompt' || this.selectedRow?.['text_node_type'] === 'SdsPrompt';
            this.isSpeechEditorVisible =
                this.getTextNodeType() === 'SdsCommand' || this.selectedRow?.['text_node_type'] === 'SdsCommand';
            this.isMetaEditorVisible =
                (this.selectedRow?.['data']?.metatext_info && this.selectedRow?.['data']?.metatext_info !== '_') ||
                (this.selectedRow?.['metatext_info'] && this.selectedRow?.['metatext_info'] !== '_');
            this.isTextLocked = row?.data?.locked === 'Locked';

            if (Type) {
                this.translationSourceType = Type;
                const props = this.getProjectParameters();
                if (Type === 'Table') {
                    this.lineBreakMode = row?.linebreakMode === '_' ? 'Manual' : row.linebreakMode;
                    this.fontFileId = row?.fontFileId;
                    this.fontName = row?.fontName;
                    this.translationText = text;
                    this.maxWidth = this.checkIfEqualUnderScore(row.max_width);
                    this.selectedLanguageCode = selectedLangHeader?.langCode || selectedLang;
                    this.commentService.setTextNodeForComments(this.selectedRow['db_text_node_id'], this.languageId);
                    const languageId = this.getLanguageCode(this.getLoggedInUserInformation().role, props).id;

                    this.getOtherTranslations(
                        `${this.selectedRow['db_text_node_id']}`,
                        this.selectedLanguageCode,
                        this.getTranslationIdIfNotEditor()
                    );
                    this.commentsDialogService.foreignLanguageChanged = languageId !== this.languageId;
                    this.multipleLock = [];
                    const editorLangWiseDataFromAPI = row.language_data.find(
                        (item) => item.language_code === this.selectedLanguageCode
                    );
                    const langProps = editorLangWiseDataFromAPI['language_props'];
                    if (
                        this.projectData?.translation?.length > 0 &&
                        langProps.length > 0 &&
                        this.projectData?.dbTextNodeId === this.selectedRow['db_text_node_id']
                    ) {
                        this.selectedRow['language_data']
                            .find((item) => item.language_id === this.projectData.languageId)
                            .language_props.find((lang) => lang?.prop_name === 'Text').value =
                            this.projectData.translation;
                        this.selectedRow['language_data']
                            .find((item) => item.language_id === this.projectData.languageId)
                            .language_props.find((lang) => lang?.prop_name === 'State').value = this.projectData.status;
                    }
                    this.forStatusChangebject = {
                        node_id: row.text_node_id,
                        language_code: this.selectedLanguageCode,
                        array_item_index: this.checkIfEqualUnderScore(row.array_item_index),
                        variant_id: this.checkIfEqualUnderScore(row.variant_id),
                        translation_text: langProps?.find((item) => item.prop_name === 'Text').value,
                    };
                    this.langTabelProps = langProps;
                    row.language_data.forEach((item) => {
                        this.selectLangWiseData(row, item);
                    });

                    this.maxCharacters = this.checkIfEqualUnderScore(row?.max_characters);
                    this.maxRow = this.checkIfEqualUnderScore(row?.max_lines);
                    this.tableSelectedRow = row;
                } else {
                    if (this.checkTextNodeId(row)) {
                        const translation = this.projectData.languageGroup.find(
                            (ele) => ele.languageId === row['data'].language_id
                        )?.translation;
                        const languageId = this.projectData.languageGroup.find(
                            (ele) => ele.languageId === row['data'].language_id
                        )?.languageId;
                        const status = this.projectData.languageGroup.find(
                            (ele) => ele.languageId === row['data'].language_id
                        )?.status;
                        if (row['data'].language_id === languageId) {
                            row['data'].translation = translation === '_' ? '' : translation;
                            row['data'].state = status;
                        }
                        if (row?.['children']) {
                            row['children'].forEach((elem) => {
                                this.projectData.languageGroup.forEach((ele) => {
                                    if (ele.languageId === elem['data'].language_id) {
                                        elem['data']['translation'] = ele.translation === '_' ? '' : ele.translation;
                                        elem['data'].state = ele.status;
                                    }
                                });
                            });
                        }
                    }

                    this.lineBreakMode = row?.data?.linebreakMode === '_' ? 'Manual' : row?.data?.linebreakMode;
                    this.fontFileId = row?.data?.fontFileId;
                    this.fontName = row?.data?.fontName;
                    this.maxWidth =
                        row.data.max_width === '_' || row?.parent?.data?.max_width === '_'
                            ? null
                            : row.data.max_width || row?.parent?.data?.max_width;
                    this.maxCharacters = this.checkIfEqualUnderScore(row?.data?.max_characters);
                    this.maxRow = this.checkIfEqualUnderScore(row?.data?.max_lines);
                    this.isTextWarningVisible = false;
                    this.lockUnlockTextNode(true);
                    this.commentService.setTextNodeForComments(
                        this.selectedRow?.['data']?.['db_text_node_id'],
                        this.selectedRow?.['data']?.['language_id']
                    );

                    const languageCode = this.isEditorLanguage()
                        ? this.getLanguageCode(this.getLoggedInUserInformation().role, props).code
                        : this.LanguageCode;

                    this.getOtherTranslations(
                        `${this.selectedRow?.['data']?.['db_text_node_id']}`,
                        languageCode,
                        this.getTranslationIdIfNotEditor()
                    );

                    this.commentsDialogService.foreignLanguageChanged = !!this.selectedRow['data']?.ID;

                    this.structureSelectedRow = row;
                }
                this.stcDetailsService.setLanguageId(this.LanguageCode, this.languageId);
                this.updateTextNodeLabels();
                this.setProjectTranslationData();
                this.translationText = this.projectData.translation;
            }
        }
    }

    isTextTypeSdsPromptOrCommand(): boolean {
        return this.isPromptEditorVisible || this.isSpeechEditorVisible;
    }

    getUserInput(row) {
        this.isTextWarningVisible = row;
    }

    getContextMenu(rowData, source, selectedTreeNode?: TreeNode, selectedTableColumnLanguage?: string) {
        const props = this.getProjectParameters();

        this.treeActionItems = [
            {
                label: 'Copy',
                icon: 'pi pi-copy',
                iconStyle: { color: '#304CD9' },
                visible: !selectedTreeNode?.data?.elementId && !this.isReviewer(),
                command: () => {
                    this.copySelectedLanguage(rowData, source);
                },
            },
            {
                label: 'Paste',
                icon: 'pi pi-copy pi-align-center',
                iconStyle: { color: '#304CD9' },
                visible: !selectedTreeNode?.data?.elementId && !this.isReviewer(),
                command: () => {
                    this.onPaste();
                },
            },
            {
                label: 'Set State Done',
                icon: 'pi pi-circle-fill',
                iconStyle: { color: '#1EA97C' },
                command: () => this.changeState('Done'),
                visible: this.isWorkInProgressOrDoneMenuOptionVisible(selectedTreeNode) && !this.isReviewer(),
            },
            {
                label: 'Lock Text',
                icon: 'pi pi-lock',
                iconStyle: { color: 'text-cyan-500' },
                command: () => this.lockMultipleTextnodes('Locked'),
                visible: this.role === 'translator' && selectedTreeNode?.data?.Id && !this.isReviewer(),
            },
            {
                label: 'Unlock Text',
                icon: 'pi  pi-lock-open',
                iconStyle: { color: 'text-cyan-500' },
                command: () => this.lockMultipleTextnodes('Unlocked'),
                visible: this.role === 'translator' && selectedTreeNode?.data?.Id && !this.isReviewer(),
            },
            {
                label: 'Set State Work In Progress',
                icon: 'pi pi-circle-fill',
                iconStyle: { color: '#CD9A23' },
                command: () => this.changeState('Work in progress'),
                visible: this.isWorkInProgressOrDoneMenuOptionVisible(selectedTreeNode) && !this.isReviewer(),
            },
            {
                label: 'Labels',
                icon: 'pi pi-tag',
                iconStyle: { color: 'text-cyan-500' },
                command: () =>
                    this.labelService.assignLabel(
                        rowData,
                        source,
                        props?.projectId,
                        selectedTableColumnLanguage,
                        props?.editorLanguageCode
                    ),
                visible: this.labelService.isLabelMenuVisible(rowData, this.role) && !this.isReviewer(),
            },
            {
                label: 'Approve View',
                icon: 'pi pi-check',
                iconStyle: { color: 'text-cyan-500' },
                visible: this.isViewGroup(selectedTreeNode) && this.isReviewer(),
                command: () => this.approveRejectView(3),
            },
            {
                label: 'Reject View',
                icon: 'pi pi-times',
                iconStyle: { color: 'text-cyan-500' },
                visible: this.isViewGroup(selectedTreeNode) && this.isReviewer(),
                command: () => this.openCommentDialog(),
            },
        ];

        return this.treeActionItems;
    }

    async createSTC(isSTCCreateFromStateChange = true, sameLengthFlag = 0) {
        return new Promise((resolve, reject) => {
            const props = this.getProjectParameters();
            let parent_stc_id: any;
            let variant_id: any;
            let array_item_index: any;
            let tableRow;
            const tableSTCRow = { data: {} };
            if (this.stcDetailsService.translationSourceType === 'Table') {
                tableRow = this.mappingService.selectedTabelRowDataForMappingProposal.tabelRow;
                const langData = tableRow.language_data.find(
                    (item) =>
                        item.language_code === this.mappingService?.selectedTabelRowDataForMappingProposal?.editorLang
                );
                parent_stc_id = langData?.parent_stc_id;
                variant_id = tableRow.variant_id;
                array_item_index = this.checkIfEqualUnderScore(tableRow.array_item_index);
                tableSTCRow['data']['parent_stc_id'] = parent_stc_id;
                tableSTCRow['data']['language_id'] = langData.language_id;
                tableSTCRow['data']['stc_master_id'] = langData.stc_master_id;
                tableSTCRow['data']['translation'] = this.translationText;
                tableSTCRow['data']['lang_code'] = langData.lang_code;
                tableSTCRow['data']['ID'] = tableRow.text_node_id;
            } else {
                parent_stc_id = this.selectedRow['data']['parent_stc_id'];
                variant_id = this.selectedRow?.['data']?.variant_id;
                array_item_index = this.selectedRow?.['data']?.array_item_index;
            }

            if (this.stcDetailsService.createStc && isSTCCreateFromStateChange) {
                if (
                    this.stcDetailsService.isTextMapped &&
                    ((Roles[props?.role] === 'editor' && parent_stc_id === '_') ||
                        (Roles[props?.role] === 'translator' && parent_stc_id > 0)) &&
                    this.stcDetailsService.headerIdealText.includes('Ideal Text')
                ) {
                    this.projectService.createIdealTextFromTranslation(
                        this.stcDetailsService.translationSourceType === 'Table' ? tableSTCRow : this.selectedRow,
                        props?.translationRequestId,
                        props?.projectId,
                        props?.version,
                        variant_id,
                        array_item_index,
                        this.userService,
                        this.translationSourceType.toLowerCase(),
                        Roles[props?.role],
                        this.state,
                        this.stcDetailsService.translationSourceType === 'Table' ? tableRow : null
                    );
                    return resolve('Ideal Text Created');
                } else if (
                    this.stcDetailsService.isTextMapped &&
                    parent_stc_id > 0 &&
                    this.stcDetailsService.headerIdealText.includes('Short Form')
                ) {
                    if (this.stcDetailsService.selectedRowIdealText.short_form.length <= this.translationText.length) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Short Form is longer than Ideal Text',
                        });
                        return reject('Error');
                    }
                    if (
                        this.stcDetailsService.allAvailableShortForms.find(
                            (item) => item.short_form === this.translationText
                        ) ||
                        this.stcDetailsService.selectedRowIdealText.short_form === this.translationText
                    ) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Short Form already Exist',
                        });
                        return reject('Error');
                    }
                    if (
                        this.stcDetailsService.allAvailableShortForms.find(
                            (item) => item.short_form.length === this.translationText.length
                        ) &&
                        sameLengthFlag !== 1
                    ) {
                        sameLengthFlag = -1;
                        this.confirmationService.confirm({
                            message: `The text that you entered has the same length as the text of shortform ${
                                this.stcDetailsService.allAvailableShortForms.findIndex(
                                    (item) => item.short_form.length === this.translationText.length
                                ) + 1
                            }! <br/><br/>This is usually not recommended.
                               <br/><br/>Do you really want to create this shortform?`,
                            header: 'Confirmation',
                            icon: 'pi pi-exclamation-triangle',
                            accept: () => {
                                sameLengthFlag = 1;
                                this.projectService.createShortFormFromTranslation(
                                    this.stcDetailsService.translationSourceType === 'Table'
                                        ? tableSTCRow
                                        : this.selectedRow,
                                    props?.translationRequestId,
                                    props?.projectId,
                                    props?.version,
                                    variant_id,
                                    array_item_index,
                                    this.userService,
                                    this.stcDetailsService.allAvailableShortForms,
                                    this.messageService,
                                    this.translationSourceType.toLowerCase(),
                                    Roles[props?.role],
                                    this.state,
                                    this.stcDetailsService.translationSourceType === 'Table' ? tableRow : null
                                );
                                return resolve('Short Form Created');
                            },
                            reject: () => {
                                sameLengthFlag = -1;
                                return reject('Error');
                            },
                        });
                    }
                    if (sameLengthFlag === 1 || sameLengthFlag === 0) {
                        this.projectService.createShortFormFromTranslation(
                            this.stcDetailsService.translationSourceType === 'Table' ? tableSTCRow : this.selectedRow,
                            props?.translationRequestId,
                            props?.projectId,
                            props?.version,
                            variant_id,
                            array_item_index,
                            this.userService,
                            this.stcDetailsService.allAvailableShortForms,
                            this.messageService,
                            this.translationSourceType.toLowerCase(),
                            Roles[props?.role],
                            this.state,
                            this.stcDetailsService.translationSourceType === 'Table' ? tableRow : null
                        );
                        return resolve('Short Form Created');
                    }
                } else {
                    return resolve('No Need to create STC');
                }
            } else {
                return resolve('No Need to create STC');
            }
        });
    }

    createShortForm() {
        const props = this.getProjectParameters();
        let parent_stc_id = 0;
        let stc_id = 0;
        let language_Id = 0;
        if (this.translationSourceType === 'Table') {
            const tabelRow = this.mappingService.selectedTabelRowDataForMappingProposal.tabelRow;
            const langData = tabelRow.language_data.find(
                (item) => item.language_code === this.mappingService?.selectedTabelRowDataForMappingProposal?.editorLang
            );
            parent_stc_id = langData?.parent_stc_id;
            language_Id = langData?.language_id;
            stc_id = langData?.stc_master_id;
        } else {
            parent_stc_id = this.projectService.getParentStcid(this.selectedRow);
            language_Id = this.selectedRow['data']?.['language_id'];
            stc_id = this.selectedRow['data']?.['stc_master_id'];
        }

        if (this.translationText !== '' && parent_stc_id > 0) {
            const payload: any = {
                stc_id: parent_stc_id,
                language_id: language_Id,
                role: Roles[props?.role],
                translator_id: props?.userID,
            };

            if (Roles[props?.role] === 'editor') {
                this.activeEditorOptions.readonly = false;
                this.translationText = '';
                this.eventBus.cast('changedetection:translationText', this.translationText);
                if (this.stcDetailsService.isTextMapped === true && !this.activeEditorOptions.readonly)
                    this.stcDetailsService.createStc = true;
                this.mappingService
                    .getSTCDetails('stc-master/stc-detail', payload)
                    .pipe(catchError(() => of(undefined)))
                    .subscribe((res) => {
                        if (res?.['status'] === 'OK') {
                            this.mappingService.getStcDetailsByStcIdAfterApiCall(res['data']).subscribe((response) => {
                                if (response.length > 0) {
                                    this.stcDetailsService.headerIdealText = 'Short Form ' + response.length;
                                    response.map((item) => {
                                        this.stcDetailsService.allAvailableShortForms.push({
                                            short_form: item.Text,
                                            short_form_id: item.id,
                                        });
                                    });
                                    const idealText = this.stcDetailsService.allAvailableShortForms.shift();
                                    this.stcDetailsService.selectedRowIdealText = idealText;
                                }
                            });
                        }
                    });
            }
            if (Roles[props?.role] === 'translator') {
                this.activeEditorOptions.readonly = true;
                const checkPayload: any = {
                    stc_id: stc_id,
                    translator_id: props?.userID,
                };
                this.projectService.checkShortFormByTranslator(checkPayload).subscribe((res) => {
                    if (res['status'] === 'NOK') {
                        this.activeEditorOptions.readonly = false;
                        this.translationText = '';
                        if (this.stcDetailsService.isTextMapped === true) this.stcDetailsService.createStc = true;
                        this.mappingService.getSTCDetails('stc-master/stc-detail', payload).subscribe((result) => {
                            if (result['status'] === 'OK') {
                                this.mappingService
                                    .getStcDetailsByStcIdAfterApiCall(result['data'])
                                    .subscribe((response) => {
                                        if (response.length > 0) {
                                            this.stcDetailsService.headerIdealText = 'Short Form ' + response.length;
                                            response.map((item) => {
                                                this.stcDetailsService.allAvailableShortForms.push({
                                                    short_form: item.Text,
                                                    short_form_id: item.id,
                                                });
                                            });
                                            const idealText = this.stcDetailsService.allAvailableShortForms.shift();
                                            this.stcDetailsService.selectedRowIdealText = idealText;
                                        }
                                    });
                            }
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'You are not allowed to add more than one short form',
                        });
                    }
                });
            }
        }
    }

    changeTextnodeStatus(node, status, translationText: string) {
        //TODO Refactoring of this function since repetitive code and Optimize with Copy Paste
        const props = this.getProjectParameters();
        let payload: any = {};
        if (this.translationSourceType === 'Table') {
            payload = {
                project_id: props?.projectId,
                version_id: props?.version,
                role: Roles[props?.role],
                user_id: props?.userProps?.id,
                data: [
                    {
                        node_id: node?.data?.TextNodeId ? node?.data?.TextNodeId : node?.data?.ID,
                        language_code: node?.data?.TextNodeId
                            ? props?.['editorLanguageCode'].trim()
                            : node?.data?.context,
                        array_item_index: node?.data?.array_item_index,
                        variant_id: node?.data?.variant_id,
                        translation_text: node?.data?.translation === '_' ? '' : translationText,
                        translation_status: status,
                        unresolvedChars: this.unresolvedSymbols ?? [],
                        width: this.lengthCalculationWidth ?? 0,
                        lines: this.linesWidth.length ?? 0,
                    },
                ],
            };
            if (!this.isAcceptedByEditor) {
                if (this.translationSourceType === 'Table') {
                    payload.data = [
                        {
                            node_id: this.forStatusChangebject?.node_id,
                            language_code: this.forStatusChangebject?.language_code,
                            array_item_index: this.forStatusChangebject?.array_item_index,
                            variant_id: this.forStatusChangebject?.variant_id,
                            translation_text: this.forStatusChangebject?.translation_text === '' ? '' : translationText,
                            translation_status: status,
                            unresolvedChars: this.unresolvedSymbols ?? [],
                            width: this.lengthCalculationWidth ?? 0,
                            lines: this.linesWidth.length ?? 0,
                        },
                    ];
                }
            }
        } else {
            payload.project_id = props?.projectId;
            payload.version_id = props?.version;
            payload.role = Roles[props?.role];
            payload.user_id = props?.userProps?.id;
            const nodeProperties = [];

            if (this.isAcceptedByEditor) {
                nodeProperties.push({
                    node_id: node?.data?.TextNodeId,
                    language_code: props?.['editorLanguageCode'].trim(),
                    array_item_index: node?.data?.array_item_index,
                    variant_id: node?.data?.variant_id,
                    translation_text: node?.data?.translation === '_' ? '' : translationText,
                    translation_status: status,
                    unresolvedChars: this.unresolvedSymbols ?? [],
                    width: this.lengthCalculationWidth ?? 0,
                    lines: this.linesWidth.length ?? 0,
                });
                node?.['children'].map((item) => {
                    if (item?.data?.state == 'Done' && item?.data?.locked != 'Locked') {
                        nodeProperties.push({
                            node_id: item?.data?.ID,
                            language_code: item?.data?.context,
                            array_item_index: item?.data?.array_item_index,
                            variant_id: item?.data?.variant_id,
                            translation_text: node?.data?.translation === '_' ? '' : translationText,
                            translation_status: status,
                            unresolvedChars: this.unresolvedSymbols ?? [],
                            width: this.lengthCalculationWidth ?? 0,
                            lines: this.linesWidth.length ?? 0,
                        });
                    }
                });
                payload.data = nodeProperties;
            } else {
                let lang;
                if (Roles[props?.role] === 'editor') {
                    lang = node?.data?.TextNodeId ? props?.['editorLanguageCode'].trim() : node?.data?.context;
                }
                if (Roles[props?.role] === 'translator') {
                    lang = props?.sourceLangCode.trim();
                }
                payload.data = [
                    {
                        node_id: node?.data?.TextNodeId ? node?.data?.TextNodeId : node?.data?.ID,
                        language_code: lang,
                        array_item_index: node?.data?.array_item_index,
                        variant_id: node?.data?.variant_id,
                        translation_text: node?.data?.translation === '_' ? '' : translationText,
                        translation_status: status,
                        unresolvedChars: this.unresolvedSymbols ?? [],
                        width: this.lengthCalculationWidth ?? 0,
                        lines: this.linesWidth.length ?? 0,
                        exception: node?.data?.isException,
                    },
                ];
            }
        }
        if (props.role === Roles.translator) {
            payload.translation_request_id = props.translationRequestId;
        }
        this.textNodeSaved = true;
        this.textChanged = false;
        const url = `tabular-format/save_status`;
        return this.apiService.postTypeRequest(url, payload);
    }
    async changeState(state, done = 0, isNext = false, stateFromConfirmation = false) {
        const user = this.getLoggedInUserInformation();
        if (this.commentsDialogService.foreignLanguageChanged && user.role === Roles.editor) {
            this.detectChangesInTranslation(state, done, isNext, stateFromConfirmation);
            return;
        }

        this.state = state;
        const regExpValue = /[^a-zA-Z\s0-9\-/]/;
        const translationText =
            this.forStatusChangebject && this.translationSourceType === 'Table'
                ? this.forStatusChangebject.translation_text
                : this.selectedRow['data'].translation;
        if (this.selectedRow) {
            // this.activeEditorOptions.readonly = true;
            if (isNext) {
                this.isSaveNext = true;
            }
            if (translationText.length === 0 && done === 0 && state === 'Done') {
                this.displayChangeStateDialog = true;
                this.traslateStatus = `Detected discrepancies in Translation`;
                this.translateWarning = `The text is empty do you really want to set an empty text to ‘${state}’?`;
            } else if (regExpValue.test(translationText) && done === 0 && state === 'Done') {
                this.displayChangeStateDialog = true;

                this.traslateStatus = `Detected discrepancies in Translation:`;
                this.translateWarning = `The text contains special characters do you really want to set text to be ‘${state}’?`;
            } else if (this.isLengthError && done === 0 && state === 'Done') {
                this.displayChangeStateDialog = true;
                this.traslateStatus = `Detected discrepancies in Translation:`;
                this.translateWarning = `The text exceeded the max length do you really want to set text to be ‘${state}’?`;
            } else {
                await this.createSTC().then(
                    () => {
                        this.changeTextnodeStatus(this.selectedRow, state, translationText)
                            .pipe(catchError(() => of(undefined)))
                            .subscribe({
                                next: (res) => {
                                    if (res?.['status'] === 'OK') {
                                        this.isSaveButtonDisabled = true;

                                        if (this.translationSourceType !== 'Table') {
                                            if (!stateFromConfirmation) {
                                                this.selectedRow['data']['state'] = state;
                                            }
                                            if (this.selectedRow?.['data']?.['TextNodeId']) {
                                                this.countDoneTextNodesForStructure(this.allParentGroup);
                                            }
                                            if (this.isSaveNext) {
                                                isNext = true;
                                                this.isSaveNext = false;
                                            }
                                            res = Object.assign(res, { isNext: isNext, state });

                                            this.eventBus.cast('structure:textnodeupdate', res);
                                            this.displayChangeStateDialog = false;
                                            this.inheritParentPropertiesToChildLanguages(state);
                                        } else {
                                            if (this.langTabelProps && !stateFromConfirmation) {
                                                this.langTabelProps.find((item) => item.prop_name === 'State').value =
                                                    state;
                                            }
                                            this.updateTextAndStateInStructureView(
                                                this.selectedRow['db_text_node_id'],
                                                state,
                                                translationText,
                                                this.expandedGroup
                                            );
                                            if (this.isSaveNext) {
                                                isNext = true;
                                                this.isSaveNext = false;
                                                this.eventBus.cast('table:navigation', {
                                                    action: 'next',
                                                });
                                            }
                                            this.textNodeSaved = true;
                                            this.textChanged = false;
                                            this.displayChangeStateDialog = false;
                                            this.displayEditorConfirmDialog = false;
                                            this.isTextWarningVisible = false;
                                            this.isAcceptedByEditor = false;
                                        }
                                        this.setProjectTranslationData(state);
                                    }
                                },
                            });
                    },
                    () => {
                        this.displayEditorConfirmDialog = false;
                        this.activeEditorOptions.readonly = false;
                    }
                );
            }
        }
    }

    showEditorConfirmDialog() {
        this.displayEditorConfirmDialog = true;
    }
    onConfirmByEditor() {
        this.isAcceptedByEditor = true;
        this.changeState('Work in progress');
    }
    onRejectByEditor() {
        this.changeState('Work in progress');
        this.isAcceptedByEditor = false;
        this.displayEditorConfirmDialog = false;
    }
    // save unicode
    saveUnicode(data: any) {
        const url = `tabular-format/save_status`;
        return this.apiService.postTypeRequest(url, data);
    }

    // set text node status to lock/unlock
    lockUnlockTextNode(singleNode = false) {
        this.multipleLock = [];
        const props = this.getProjectParameters();
        if (!singleNode) {
            this.multipleLock.push({
                ...(this.selectedRow?.['data']?.['TextNodeId']
                    ? this.selectedRow?.['data']
                    : this.selectedRow?.['parent']?.['data']),
            });
            if (this.selectedRow?.['data']?.locked === 'Locked') {
                this.checkedLockedValue.push(this.multipleLock[0]);
            }

            if (this.selectedRow?.['children']) {
                this.selectedRow?.['children'].map((node) => {
                    if (node.data.locked === 'Locked') {
                        this.checkedLockedValue.push(node.data);
                    }
                    this.multipleLock.push({ ...node.data });
                });
            }
        } else {
            this.multipleLock.push({
                ...this.selectedRow?.['data'],
            });
            this.multipleLock[0]['ID'] = this.selectedRow?.['data']?.['TextNodeId']
                ? this.selectedRow?.['data']?.['TextNodeId']
                : this.selectedRow?.['parent']?.['data']?.['TextNodeId'];
        }
        this.multipleLock[0]['context'] = this.selectedRow?.['data']?.['TextNodeId']
            ? props?.editorLanguageCode
            : this.selectedRow?.['data']?.['context'];
    }
    getLockedStatusValue(lockstatus) {
        this.multipleLock.find((x) => x === lockstatus).locked = lockstatus.locked === 'Locked' ? 'Unlocked' : 'Locked';
    }
    checkUncheckAll(status) {
        this.checkedLockedValue = [];
        this.multipleLock.forEach((element) => {
            element.locked = status;
            if (status === 'Locked') this.checkedLockedValue.push(element);
        });
    }
    lockMultipleTextnodes(action = null, source?) {
        const props = this.getProjectParameters();
        if (action) {
            this.multipleLock[0].locked = action;
        }
        let data = [];
        data = this.multipleLock.map((item) => {
            return {
                node_id: item?.TextNodeId ? item?.TextNodeId : item.ID,
                language_code: !source && item?.TextNodeId ? props?.editorLanguageCode : item?.context,
                lock: item.locked,
                array_item_index: this.checkIfEqualUnderScore(item.array_item_index),
                variant_id: this.checkIfEqualUnderScore(item.variant_id),
            };
        });

        const payload = {
            project_id: props?.projectId,
            version_id: props?.version,
            user_id: props?.userID,
            data: data,
        };

        this.checkedLockedValue = [];
        const url = `tabular-format/lock_state`;
        return this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        let i = 0;
                        if (this.translationSourceType !== 'Table') {
                            this.multipleLock.forEach((node, index) => {
                                if (index === 0) {
                                    this.selectedRow['data'].locked = node.locked;
                                    return;
                                }
                                this.selectedRow['children'][i]['data']['locked'] = node.locked;
                                i++;
                            });
                            this.eventBus.cast('structure:textnodeupdate', res);
                        } else {
                            if (source) {
                                this.multipleLock.forEach((node) => {
                                    this.selectedRow['language_data']
                                        .find((lang) => lang.language_code === node.context)
                                        .language_props.find((item) => item.prop_name === 'Locked').value = node.locked;
                                });
                            } else {
                                this.selectedRow['language_data']
                                    .find((lang) => lang.language_code === this.selectedLanguageCode)
                                    .language_props.find((item) => item.prop_name === 'Locked').value = action;
                            }
                        }
                    }
                },
            });
    }
    selectLangWiseData(row, item) {
        this.multipleLock.push({
            ID: row?.text_node_id,
            array_item_index: row?.array_item_index,
            context: item.language_code,
            language_id: item.language_id,
            locked: 'Locked',
            metatext_info: row?.metatext_info,
            parent_stc_id: '_',
            state: item.language_props?.find((element) => element?.prop_name === 'State').value,
            stc_master_id: '_',
            stc_shortform_id: '_',
            translation: item.language_props?.find((element) => element?.prop_name === 'Text').value,
            translation_lastchange: item.language_props?.find((element) => element?.prop_name === 'Last change').value,
            user: item.language_props?.find((element) => element?.prop_name === 'User')?.value,
            variant_id: row?.variant_id,
        });
    }

    undo(): void {
        !this.isUndoPressed && this.translationDataUpdate('Undo');
    }

    redo(): void {
        this.translationDataUpdate('Redo');
    }

    translationDataUpdate(action = '') {
        const props = this.getProjectParameters();
        if (action === '') {
            this.changedBy = props?.userProps?.email;
            this.lastChange = this.datePipe.transform(new Date(), 'd/M/yyyy, hh:mm:ss a');
        } else {
            if (
                this.lastTranslationText !== this.translationText &&
                (action === 'Undo' || (action === 'Redo' && this.isUndoPressed))
            ) {
                this.changedBy = props?.userProps?.email;
                this.lastChange = this.datePipe.transform(new Date(), 'd/M/yyyy, hh:mm:ss a');
                const temp = this.translationText;
                this.translationText = this.lastTranslationText;
                this.lastTranslationText = temp;

                this.translationTextState.next(this.translationText);

                if (action === 'Undo') {
                    this.isUndoPressed = true;
                } else {
                    this.isUndoPressed = false;
                }
            }
        }
    }
    statusWiseContextMenu(LockStatus, state, columnConfigMenu) {
        if (this.role !== 'proofreader') {
            if (state === 'Done') {
                columnConfigMenu.find((item) => item.label === 'Set State Done').visible = false;
                columnConfigMenu.find((item) => item.label === 'Set State Work In Progress').visible = true;
            }
            if (state === 'Work in progress') {
                columnConfigMenu.find((item) => item.label === 'Set State Work In Progress').visible = false;
                columnConfigMenu.find((item) => item.label === 'Set State Done').visible = true;
            }
            if (LockStatus === 'Locked' && this.role === 'editor') {
                columnConfigMenu.find((item) => item.label === 'Lock Text').visible = false;
                columnConfigMenu.find((item) => item.label === 'Unlock Text').visible = true;
                columnConfigMenu.find((item) => item.label === 'Set State Work In Progress').visible = false;
                columnConfigMenu.find((item) => item.label === 'Copy').visible = false;
                columnConfigMenu.find((item) => item.label === 'Paste').visible = false;
                columnConfigMenu.find((item) => item.label === 'Set State Done').visible = false;
            }
            if (LockStatus === 'Unlocked' && this.role === 'editor') {
                columnConfigMenu.find((item) => item.label === 'Lock Text').visible = true;
                columnConfigMenu.find((item) => item.label === 'Unlock Text').visible = false;
                columnConfigMenu.find((item) => item.label === 'Copy').visible = true;
                columnConfigMenu.find((item) => item.label === 'Paste').visible = true;
            }

            if (LockStatus === 'Unlocked' && state === 'Done' && this.role === 'editor') {
                columnConfigMenu.find((item) => item.label === 'Set State Work In Progress').visible = true;
            }
            if (state === 'Length Error' || state === 'Placeholder Error') {
                columnConfigMenu.find((item) => item.label === 'Set State Done').visible = false;
                columnConfigMenu.find((item) => item.label === 'Set State Work In Progress').visible = false;
            }
        }
    }
    expandGrammerParsar(side) {
        if (side === 'right') {
            this.resolvedTextflag = !this.resolvedTextflag;
        } else {
            this.resolvedTextflagExpand = !this.resolvedTextflagExpand;
        }
    }
    copySelectedLanguage(rowData, source) {
        if (source.toLowerCase() === 'structure') {
            const copiedData = { cdata: '', pdata: '' };
            if (this.selectedRow?.['children']) {
                copiedData.cdata = this.selectedRow?.['children']
                    .map((item) => item.data)
                    .filter((language) => language.translation.length !== 0);
                if (this.selectedRow?.['data']?.translation) copiedData.pdata = this.selectedRow?.['data'];
            } else {
                copiedData.cdata = this.selectedRow?.['data'];
            }
            if (copiedData) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Text copied`,
                });
            }

            navigator.clipboard.writeText(JSON.stringify(copiedData));
        } else {
            this.copyTableRow = rowData;
            this.translationSourceType = source;
            if (this.copyTableRow) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Text copied`,
                });
            }
        }
    }

    onPaste() {
        if (this.translationSourceType.toLowerCase() === this.translationViewType.table) {
            this.isTextnodeLocked = this.isTextNodeLockedForTable();
        } else {
            this.isTextnodeLocked = this.isTextNodeLockedForStructure(false, this.selectedRow);
        }

        if (this.isTextnodeLocked) {
            this.openCopyAndPasteDialog = true;
        } else {
            this.pasteTableRow = this.selectedRow;
            this.openConfirmDialog = true;
        }
    }

    isTextNodeLockedForTable(): boolean {
        const pasteTabelRow = this.selectedRow?.['language_data'][0];
        return pasteTabelRow?.language_props?.some((obj) => obj.prop_name === 'Locked' && obj.value === 'Locked');
    }

    isTextNodeLockedForStructure(StructureLockedValue, rowData): boolean {
        if (rowData.data.locked === this.textState.Locked) {
            StructureLockedValue = true;
        }
        return StructureLockedValue;
    }

    confirmToSave(confirmStatus) {
        if (!confirmStatus) {
            this.openConfirmDialog = false;
        } else {
            if (this.translationSourceType === 'Table') {
                this.tableRowPaste();
            }
            if (this.translationSourceType.toLowerCase() === 'structure') {
                this.confirmToSaveStruture();
            }
        }
    }

    confirmToSaveStruture() {
        const url = `tabular-format/save_status`;
        const props = this.getProjectParameters();
        const payload = {
            project_id: props?.projectId,
            version_id: props?.version,
            user_id: props?.userProps?.id,
            role: Roles[props.role],
            data: [],
        };
        let dataFromCopy = {};
        navigator.clipboard.readText().then((copyData) => {
            dataFromCopy = JSON.parse(copyData);
            if (this.selectedRow?.['children']) {
                const copiedLanguages = dataFromCopy['cdata'].map((dataItem) => dataItem.context);
                this.selectedRow?.['children'].map((item) => {
                    const index = copiedLanguages.findIndex((cv) => cv === item.data.context);
                    item.data.translation = dataFromCopy['cdata'][index]?.translation ?? item.data.translation;
                    if (this.isTextNodeInWorkOrDone(dataFromCopy['cdata'][index] ?? item.data)) {
                        item.data.state = dataFromCopy['cdata'][index]?.state ?? item.data.state;
                    } else {
                        if (dataFromCopy['cdata'][index]?.translation)
                            item.data.state = TranslationStatus.WorkInProgress;
                    }
                });

                payload.data = this.selectedRow?.['children'].map((item: TreeNode) => {
                    return this.createTextNodePayloadForUpdate(item, props, NodeLevelType.Children);
                });
                if (dataFromCopy['pdata']) {
                    this.selectedRow['data']['translation'] = dataFromCopy['pdata'].translation;
                    if (this.isTextNodeInWorkOrDone(dataFromCopy['pdata'])) {
                        this.selectedRow['data']['state'] = dataFromCopy['pdata'].state;
                    } else {
                        if (dataFromCopy['pdata'].translation) {
                            this.selectedRow['data']['state'] = TranslationStatus.WorkInProgress;
                        }
                    }
                }

                payload.data.push(this.createTextNodePayloadForUpdate(this.selectedRow, props, NodeLevelType.Parent));
            } else {
                if (
                    this.selectedRow['data']['context'] === dataFromCopy['cdata'].context &&
                    dataFromCopy['cdata'].translation
                ) {
                    this.selectedRow['data']['translation'] = dataFromCopy['cdata'].translation;
                    if (this.isTextNodeInWorkOrDone(dataFromCopy['cdata'])) {
                        this.selectedRow['data']['state'] = dataFromCopy['cdata'].state;
                    } else {
                        if (dataFromCopy['cdata']?.translation)
                            this.selectedRow['data']['state'] = TranslationStatus.WorkInProgress;
                    }
                }
                payload.data.push(this.createTextNodePayloadForUpdate(this.selectedRow, props, NodeLevelType.Children));
            }

            this.apiService
                .postTypeRequest(url, payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe({
                    next: (res) => {
                        if (res?.['status'] === 'OK') {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: `Data successfully pasted`,
                            });
                            this.openConfirmDialog = false;
                        }
                    },
                });
        });
    }

    tableRowPaste() {
        const props = this.getProjectParameters();
        const pasteDataSave = this.processPasteDataSave();
        if (pasteDataSave.length > 0) {
            this.projectService
                .changeAndSaveTranslationStatus({
                    project_id: props?.projectId,
                    role: Roles[props?.role],
                    version_id: this.checkIfEqualUnderScore(props?.version),
                    user_id: props?.userID,
                    data: pasteDataSave,
                })
                .pipe(catchError(() => of(undefined)))
                .subscribe((res) => {
                    if (res?.['status'] === 'OK') {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: `Data successfully pasted`,
                        });
                        this.openConfirmDialog = false;
                    }
                });
        }
    }
    private processPasteDataSave() {
        const copyRowLangData = this.copyTableRow?.language_data;
        const pasteDataSave = [];
        copyRowLangData.forEach((element) => {
            if (element) {
                const pasteTableLangData = this.pasteTableRow?.language_data;
                const pasteRowLangProps = pasteTableLangData.find(
                    (item) => item.language_id === element.language_id
                ).language_props;
                if (element.language_props.find((item) => item.prop_name === 'Locked').value !== 'Locked')
                    if (pasteRowLangProps) {
                        const copytext = element.language_props.find((item) => item.prop_name === 'Text').value;
                        if (this.checkIfEqualUnderScore(copytext)?.length > 0) {
                            pasteRowLangProps.find((item) => item.prop_name === 'Text').value =
                                this.checkIfEqualUnderScore(copytext);
                            const state = element.language_props.find((item) => item.prop_name === 'State').value;
                            if (this.isTextNodeInWorkOrDone({ state: state }))
                                pasteRowLangProps.find((item) => item.prop_name === 'State').value = state;
                            else
                                pasteRowLangProps.find((item) => item.prop_name === 'State').value =
                                    TranslationStatus.WorkInProgress;
                            const obj = {
                                array_item_index: this.checkIfEqualUnderScore(this.pasteTableRow['array_item_index']),
                                language_code: element.language_code,

                                node_id: this.pasteTableRow['text_node_id'],
                                translation_status: pasteRowLangProps.find((item) => item.prop_name === 'State').value,
                                translation_text: this.checkIfEqualUnderScore(copytext),
                                variant_id: this.checkIfEqualUnderScore(this.pasteTableRow['variant_id']),
                                unresolvedChars: [],
                                width: 0,
                                lines: 0,
                            };
                            pasteDataSave.push(obj);
                        }
                    }
            }
        });
        return pasteDataSave;
    }

    ScrollToSelectedItem(table, elementIdName: string): number {
        let idx = -1;
        if (!!table?.value && !!table?.selection) {
            idx = 0; // Count levels deep
            if (idx > -1) {
                setTimeout(() => {
                    document
                        .getElementById(elementIdName)
                        .querySelectorAll('tr.p-element.p-highlight')[0]
                        ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest',
                        });
                }, 500);
            }
        }
        return idx;
    }

    calculateWidth(node: TreeNode) {
        if (this.translationText !== '') {
            this.calculateTextWidth(this.translationText, node);
        } else {
            this.resetLengthCalulationParms();
        }
    }

    calculateTextWidth(text: string, node: TreeNode) {
        const calculateWordLineBreakPayload = {} as CalculateWordLineBreakPayload;
        calculateWordLineBreakPayload.bold = false;
        calculateWordLineBreakPayload.italic = false;
        calculateWordLineBreakPayload.lcFile = this.getLcPath(node);
        calculateWordLineBreakPayload.fontDir = this.getCalculateLengthRequiredParms?.fontDir;
        const translationTextWithPlaceholderWorstCaseValue =
            this.placeholderService.getTranslationTextWithPlaceholderWorstCaseValueForLC(
                node,
                text,
                node?.['parent']?.['data']
            );

        if (this.translationSourceType === 'Table') {
            calculateWordLineBreakPayload.font = node?.['fontName'];
            calculateWordLineBreakPayload.fontSize = 12;
            calculateWordLineBreakPayload.text =
                translationTextWithPlaceholderWorstCaseValue.translationText?.split('\n');
            calculateWordLineBreakPayload.fontType = node?.['fontType'];
        } else {
            calculateWordLineBreakPayload.font = node?.['data'].fontName;
            calculateWordLineBreakPayload.fontSize = 12;
            calculateWordLineBreakPayload.text =
                translationTextWithPlaceholderWorstCaseValue.translationText?.split('\n');
            calculateWordLineBreakPayload.fontType = node?.['data'].fontType;
        }
        if (calculateWordLineBreakPayload) {
            this.socket$.next({
                type: 'calculateWidth-client',
                content: calculateWordLineBreakPayload,
            });
        } else {
            this.resetLengthCalulationParms();
        }
        this.translationCheckService.setFillRateLog(this.progressBarWidth, this.config);
    }
    setUnreslovedError(res, node: TreeNode) {
        if (this.translationRoleEnum[this?.getCalculateLengthRequiredParms?.translateRole] === 'Constrained') {
            this.unresolvedSymbols = res['error-details'];
            if (this.unresolvedSymbols) {
                this.hasUnresolvedCharacters = true;
                this.setTextNodeLengthStatus(node, true, 'Unresolved Chars');
            }
        }
    }
    calculateWidthOrWordLineBreak(node: TreeNode) {
        this.calculateTextWordLineBreak(this.translationText, node);
    }

    calculateTextWordLineBreak(text: string, node: TreeNode) {
        const calculateWordLineBreakPayload = {} as CalculateWordLineBreakPayload;
        calculateWordLineBreakPayload.bold = false;
        calculateWordLineBreakPayload.italic = false;
        calculateWordLineBreakPayload.lcFile = this.getLcPath(node);
        calculateWordLineBreakPayload.fontDir = this.getCalculateLengthRequiredParms?.fontDir;
        calculateWordLineBreakPayload.text =
            this.placeholderService.getTranslationTextWithPlaceholderWorstCaseValueForLC(
                node,
                text?.split('\n').join(' '),
                node?.['parent']?.['data']
            )?.translationText;

        if (this.translationSourceType === 'Table') {
            calculateWordLineBreakPayload.font = node['fontName'];
            calculateWordLineBreakPayload.fontSize = 12;
            calculateWordLineBreakPayload.maxWidth = node['max_width'];
        } else {
            calculateWordLineBreakPayload.font = node['data'].fontName;
            calculateWordLineBreakPayload.fontSize = 12;
            calculateWordLineBreakPayload.maxWidth = node['data'].max_width;
            calculateWordLineBreakPayload.fontType = node['data'].fontType;
        }
        if (calculateWordLineBreakPayload) {
            this.socket$.next({
                type: 'calculateWordLineBreak-client',
                content: calculateWordLineBreakPayload,
            });
        }
    }

    createPositionWiseTransalationText(index, node: TreeNode) {
        const spiltString = this.translationText.split('');
        spiltString.splice(index, 0, '\n');
        this.translationText = spiltString.join('');
        this.setLineBreakErrors(node);
    }

    afterLengthCalUpdateStructureOrTabelNode(node: TreeNode) {
        if (this.progressBarWidth > 100) {
            this.setTextNodeLengthStatus(node, true, 'Length Error');
        } else {
            if (
                !this.isCurrentTranslationWidthInLimit() ||
                !this.isCurrentTranslationNoOfLineInLimit() ||
                this.isCurrentTranslationCharacterInLimit()
            ) {
                this.setTextNodeLengthStatus(node, true, 'Length Error');
            } else {
                if (this.unresolvedSymbols?.length === 0) {
                    this.resetError();
                    if (this.translationSourceType !== 'Table' && node?.['data'].state !== 'Done') {
                        this.setTextNodeLengthStatus(node, false, 'Work in progress');
                    } else {
                        if (
                            node?.['language_data'] &&
                            node?.['language_data']
                                ?.find((item) => item.language_code === this.selectedLanguageCode)
                                .language_props.find((lang) => lang?.prop_name === 'State').value !== 'Done'
                        ) {
                            this.setTextNodeLengthStatus(node, false, 'Work in progress');
                        }
                    }
                }
            }
        }
    }
    setTextNodeLengthStatus(node: TreeNode, isError = false, state = '') {
        if (this.translationRoleEnum[this?.getCalculateLengthRequiredParms?.translateRole] === 'Constrained') {
            if (isError) this.textNodeErrors.push(state);
            this.setTextNodeStatus(isError, state, node);
        } else {
            this.setTextNodeStatus(false, 'Work in progress', node);
        }
    }

    //call Unresolved Characters List model popup
    openUnresolvedCharactersList() {
        this.openUnresolvedCharactersModel = true;
    }

    checkResolveFont() {
        const calculateWordLineBreakPayload = {} as CalculateWordLineBreakPayload;
        calculateWordLineBreakPayload.lcFile = this.getLcPath(this.selectedRow);
        calculateWordLineBreakPayload.fontDir = this.getCalculateLengthRequiredParms?.fontDir;
        calculateWordLineBreakPayload.font = this.fontName;
        this.fontIsUnresloved = false;
        if (calculateWordLineBreakPayload) {
            this.socket$.next({
                type: 'canResolveFont-client',
                content: calculateWordLineBreakPayload,
            });
        }
    }
    checkMaxCharacterMaxLength(node: TreeNode) {
        if (node && !this.fontIsUnresloved) {
            if (this.translationSourceType === 'Table') {
                this.maxCharacters = this.checkIfEqualUnderScore(node['max_characters']);
                this.maxRow = this.checkIfEqualUnderScore(node['max_lines']);
                this.fontName = this.checkIfEqualUnderScore(node['fontName']);
            } else {
                this.maxCharacters = this.checkIfEqualUnderScore(node['data']['max_characters']);
                this.maxRow = this.checkIfEqualUnderScore(node['data']['max_lines']);
                this.fontName = node['data']['fontName'] === '_' ? 'FreeSans' : node['data']['fontName'];
            }
            if (
                this.areFontPropsAvailableInLengthCalculation() &&
                this.getLcPath(node) !== '_' &&
                (!this.isSpeechEditorVisible || !this.isSpeechEditorVisible)
            )
                this.lengthCalculateAndCheckUnreslovedFont(node);
        }
    }
    resetLengthCalulationParms() {
        this.unresolvedSymbols = [];
        this.hasUnresolvedCharacters = false;
        this.linesWidth = [];
        this.progressBarWidth = 0;
        this.calculateWidthByLengthCalculation = 0;
        this.lengthCalculationWidth = 0;
    }
    lengthCalculateAndCheckUnreslovedFont(node: TreeNode) {
        if (node) {
            this.setLineBreakErrors(node);
            this.calculateLength(node);
        }
    }
    calculateLength(node: TreeNode) {
        if (node?.['data']?.linebreakMode === 'Word' || node?.['linebreakMode'] === 'Word') {
            this.calculateWidthOrWordLineBreak(node);
        } else {
            this.calculateWidth(node);
        }
    }

    //TODO refactor length calculation payload logic and maintain same naming convention.
    setCalculateLengthApiPayload(projectdata: ProjectLengthCalculation): void {
        const calculateWordLineBreakPayload: CalculateWordLineBreakPayload = {};
        calculateWordLineBreakPayload.lcFile = projectdata?.lcPath;
        calculateWordLineBreakPayload.fontDir = projectdata?.fontPath;
        calculateWordLineBreakPayload.translateRole = projectdata?.translation_role;
        this.setCalculateLengthRequiredParms = calculateWordLineBreakPayload;
        this.localStorageService.set('calculateWordLineBreakPayload', JSON.stringify(calculateWordLineBreakPayload));
        this.translationRole = projectdata?.translation_role;
        this.localStorageService.set('translation_role', +projectdata?.translation_role);
    }
    setLineBreakErrors(node: TreeNode) {
        const transaltionTextRows = this.translationText?.split('\n');
        const maxLengthTranslationText = Math.max(...transaltionTextRows.map((item) => item.length));
        if (!!this.maxCharacters && maxLengthTranslationText > this.maxCharacters) {
            this.setTextNodeLengthStatus(node, true, 'Length Error');
        }
        if (!!this.maxRow && transaltionTextRows?.length > this.maxRow) {
            this.setTextNodeLengthStatus(node, true, 'Length Error');
        }
    }
    areUnresolvedCharsInTextNode() {
        return this.hasUnresolvedCharacters || this.fontIsUnresloved;
    }

    areFontPropsAvailableInLengthCalculation() {
        return this.getCalculateLengthRequiredParms?.fontDir !== '_' && this.fontName !== '_';
    }
    isCurrentTranslationWidthInLimit() {
        if (this.translationSourceType !== 'Table') {
            return (
                (!!this.maxWidth && this.maxWidth >= this.selectedRow?.['data']?.translation?.length) || !this.maxWidth
            );
        } else {
            return (!!this.maxWidth && this.maxWidth >= this.tableText.length) || !this.maxWidth;
        }
    }
    isCurrentTranslationNoOfLineInLimit() {
        return (!!this.maxRow && this.maxRow >= this.translationText.split('\n').length) || !this.maxRow;
    }

    socketSubscription() {
        this.socket$.asObservable().subscribe((res) => {
            if (res?.content) {
                const [response] = res.content;
                const selectedNode = this.selectedNodes[0];
                if (res?.type !== 'canResolveFont-server') {
                    this.selectedNodes = this.selectedNodes.slice(1);
                }

                if (res?.type === 'calculateWidth-server') {
                    if (response?.success) {
                        let width = 0;
                        if (response['error-details']?.length > 0) {
                            this.setUnreslovedError(response, selectedNode);
                        } else {
                            if (this?.maxWidth != null) {
                                width = this.getWidth(response);
                            }
                            this.hasUnresolvedCharacters = false;
                            this.unresolvedSymbols = [];
                        }
                        this.progressBarWidth = Math.round(width);
                        this.translationCheckService.setFillRateLog(this.progressBarWidth, this.config);
                        this.afterLengthCalUpdateStructureOrTabelNode(selectedNode);
                    } else {
                        this.setUnreslovedError(response, selectedNode);
                    }
                    if (this.isMultipleLanguagesForLengthCalculation && this.selectedNodes.length > 0) {
                        this.resetError();
                        this.checkMaxCharacterMaxLength(this.selectedNodes[0]);
                    } else {
                        this.isMultipleLanguagesForLengthCalculation = false;
                    }
                }

                if (res?.type === 'calculateWordLineBreak-server') {
                    if (response?.success) {
                        this.position = response['position'];
                        if (this.position.length > 0) {
                            this.translationText = this.translationText?.replaceAll('\n', '');
                            this.position.forEach((element, index) => {
                                this.createPositionWiseTransalationText(element, selectedNode);
                                if (this.position.length - 1 === index) {
                                    this.calculateWidth(selectedNode);
                                }
                            });
                        } else {
                            this.calculateWidth(selectedNode);
                        }
                    } else {
                        this.calculateWidth(selectedNode);
                        this.progressBarWidth = 0;
                    }
                }

                if (res?.type === 'canResolveFont-server') {
                    if (this.translationText?.length > 0) {
                        this.calculateLength(selectedNode);
                    } else {
                        this.resetLengthCalulationParms();
                    }
                    if (!response?.resolved) {
                        this.setFontUnresolveError(selectedNode);
                    } else {
                        this.fontIsUnresloved = false;
                    }
                }
            }
        });
    }

    setFontUnresolveError(node: TreeNode) {
        if (this.translationRoleEnum[this?.getCalculateLengthRequiredParms?.translateRole] === 'Constrained') {
            this.fontIsUnresloved = true;
            this.setTextNodeLengthStatus(node, true, 'Unresolved font');
        }
    }

    afterFinishTranslationMenuHideShow(contextMenuItems: MenuItem[], status: string, menuLabel: string[]): MenuItem[] {
        return contextMenuItems.map((menu: MenuItem) => {
            switch (status) {
                case 'Expired':
                    menu.disabled = menuLabel.includes(menu.label);
                    break;
                case 'New':
                    menu.disabled = false;
                    break;
                default:
                    menu.disabled = menuLabel.includes(menu.label);
            }
            return menu;
        });
    }

    isCurrentTranslationCharacterInLimit() {
        const transaltionTextRows = this.translationText?.split('\n') ?? [];
        const maxLengthTranslationText = Math.max(...transaltionTextRows.map((item) => item.length));
        return !!this.maxCharacters && maxLengthTranslationText > this.maxCharacters;
    }

    get tableText(): string {
        return this.selectedRow['language_data']
            .find((item) => item.language_code === this.selectedLanguageCode)
            .language_props?.find((lang) => lang?.prop_name === 'Text').value;
    }

    get textNodeState(): string {
        return this.translationSourceType === 'structure'
            ? this.selectedRow?.['data']?.['state']
            : this.selectedRow['language_data']
                  ?.find((item) => item.language_code === this.selectedLanguageCode)
                  ?.language_props.find((lang) => lang?.prop_name === 'State').value;
    }
    get textNodeLabels(): string {
        return this.translationSourceType === 'structure'
            ? this.selectedRow?.['data']?.['labels']
            : this.selectedRow['language_data']
                  ?.find((item) => item.language_code === this.selectedLanguageCode)
                  ?.language_props.find((lang) => lang?.prop_name === 'Labels').value;
    }
    get languageId(): number {
        return this.translationSourceType === 'structure'
            ? this.selectedRow?.['data']?.['language_id']
            : this.selectedRow['language_data']?.find((item) => item.language_code === this.selectedLanguageCode)
                  .language_id;
    }

    private get LanguageCode(): string {
        return this.translationSourceType === 'structure'
            ? this.selectedRow['data']?.context
            : this.selectedRow['language_data']?.find((item) => item.language_code === this.selectedLanguageCode)
                  ?.language_code;
    }

    tabletranslationText(value: string, selectedlanguage: string) {
        if (this.selectedRow['language_data']) {
            this.selectedRow['language_data']
                .find((item) => item.language_code === selectedlanguage)
                .language_props.find((lang) => lang?.prop_name === 'Text').value = value;
        }
    }

    isTextNodelatestOrModified(row: TreeNode, type: string): boolean {
        return this.isTextNodeModifiedInStructureOrTable(row, type);
    }

    isTextNodeModifiedInStructureOrTable(row: TreeNode, type: string): boolean {
        return (
            (!this.isSaveButtonDisabled || this.textChanged) &&
            (this.isTextNodeIdMatches(row, type) ||
                this.isDbTextNodeIdMatches(row, type) ||
                this.isTextIdOrLanguageIdMatches(row, type))
        );
    }

    private isDbTextNodeIdMatches(row: TreeNode, type: string): boolean {
        return type === TranslationViewType.structure
            ? row?.data?.['db_text_node_id'] !== this.oldSelectedRow['db_text_node_id']
            : row['db_text_node_id'] !== this.oldSelectedRow['db_text_node_id'];
    }

    private isTextNodeIdMatches(row: TreeNode, type: string): boolean {
        return type === TranslationViewType.structure
            ? !!row?.data?.TextNodeId &&
                  row?.data?.TextNodeId !== this.oldSelectedRow?.['TextNodeId'] &&
                  !!this.oldSelectedRow['TextNodeId']
            : row?.['text_node_id'] !== this.oldSelectedRow?.['text_node_id'] &&
                  !!this.oldSelectedRow?.['text_node_id'];
    }

    private isTextIdOrLanguageIdMatches(row: TreeNode, type: string): boolean {
        return type === TranslationViewType.structure
            ? (row?.data?.ID !== this.oldSelectedRow?.['ID'] && !!row.data?.ID) ||
                  (row?.data?.language_id !== this.oldSelectedRow?.['language_id'] &&
                      !!this.oldSelectedRow['language_id'])
            : row?.['ID'] !== this.oldSelectedRow?.['ID'] && !!row?.['ID'];
    }
    private checkIfEqualUnderScore(value) {
        return value === '_' ? null : value;
    }

    setTextNodeStatus(isError: boolean, state: string, node: TreeNode) {
        if (!isError && this.textNodeErrors.length > 0) {
            isError = true;
            state = this.textNodeErrors[0];
        }
        if (!isError && this.isTranslationCheckError) {
            isError = true;
            state = 'Error';
        }
        this.isLengthError = isError;
        if (state !== '' && node) {
            this.state = state;
            if (this.translationSourceType === 'structure') {
                node['data'].state = state;
                this.inheritParentPropertiesToChildLanguages(state);
                this.projectData.languageGroup.forEach((language) => {
                    if (language.languageId === node['data'].language_id) {
                        language.status = state;
                    }
                });
            } else {
                node['language_data']
                    .find((language) => language.language_code === this.selectedLanguageCode)
                    .language_props.find((lang) => lang?.prop_name === 'State').value = state;
            }
        }
    }

    getWidth(response: any) {
        const widthArray = response['widths']?.map((item) => item.width) ?? [];
        const resWidth = Math.max(...widthArray);
        this.lengthCalculationWidth = resWidth;
        let dynamicValueAccordingWidth = 0;
        if (this.placeholderService.placeholderDynamicValues.length > 0) {
            const dynamiceValue = this.placeholderService.placeholderDynamicValues
                .map((placeholder) => placeholder.value)
                .reduce((partialSum, a) => partialSum + a, 0);
            dynamicValueAccordingWidth = Math.round((resWidth * dynamiceValue) / 100);
        }

        const worstCaseValueAccordingWidth = resWidth + dynamicValueAccordingWidth;
        this.calculateWidthByLengthCalculation = worstCaseValueAccordingWidth;
        this.linesWidth = response['widths']?.map((item) => item.width);
        dynamicValueAccordingWidth > 0 && this.linesWidth.push(worstCaseValueAccordingWidth);
        return (worstCaseValueAccordingWidth / this.maxWidth) * 100;
    }

    setProjectTranslationData(state = null) {
        let projectData: ProjectTranslationData;
        if (
            !!this.projectData?.dbTextNodeId &&
            this.projectData?.dbTextNodeId !==
                (this.selectedRow['data']?.db_text_node_id || this.selectedRow['db_text_node_id'])
        ) {
            this.languageGroup = [];
        }
        if (this.translationSourceType === 'structure') {
            const languageObject = {};
            if (this.languageGroup.some((ele) => ele.languageId === this.selectedRow['data'].language_id)) {
                this.languageGroup.forEach((elem) => {
                    if (elem.languageId === this.selectedRow['data'].language_id) {
                        elem['languageId'] = this.selectedRow['data'].language_id;
                        elem['translation'] = this.selectedRow['data'].translation;
                        elem['status'] = state ?? this.selectedRow['data'].state;
                        elem['labels'] = this.selectedRow['data'].labels;
                    }
                });
            } else {
                languageObject['languageId'] = this.selectedRow['data'].language_id;
                languageObject['translation'] = this.selectedRow['data'].translation;
                languageObject['status'] = state ?? this.selectedRow['data'].state;
                languageObject['labels'] = this.selectedRow['data'].labels;

                this.languageGroup.push(languageObject);
            }
            projectData = {
                dbTextNodeId: this.selectedRow['data'].db_text_node_id,
                status: state ?? this.selectedRow['data'].state,
                source: this.translationSourceType,
                languageId: this.selectedRow['data'].language_id,
                translation: this.selectedRow['data'].translation,
                textNodeId: this.selectedRow['data']?.['TextNodeId'] || this.selectedRow['data']?.['ID'],
                languageGroup: this.languageGroup,
            };
        } else {
            const languageObject = {};
            const tableTranslation = this.selectedRow['language_data']
                .find((item) => item.language_code === this.selectedLanguageCode)
                .language_props.find((lang) => lang?.prop_name === 'Text').value;
            if (this.languageGroup.some((ele) => ele.languageId === this.languageId)) {
                this.languageGroup.forEach((elem) => {
                    if (elem.languageId === this.languageId) {
                        elem['languageId'] = this.languageId;
                        elem['translation'] = tableTranslation;
                        elem['labels'] = this.textNodeLabels;
                        elem['status'] = state ?? this.textNodeState;
                    }
                });
            } else {
                languageObject['languageId'] = this.languageId;
                languageObject['translation'] = tableTranslation;
                languageObject['labels'] = this.textNodeLabels;
                languageObject['status'] = state ?? this.textNodeState;
                this.languageGroup.push(languageObject);
            }
            projectData = {
                dbTextNodeId: this.selectedRow['db_text_node_id'],
                status: state ?? this.textNodeState,
                source: this.translationSourceType,
                languageId: this.languageId,
                translation: tableTranslation,
                textNodeId: this.selectedRow['text_node_id'],
                languageGroup: this.languageGroup,
            };
        }
        this.projectTranslationData = projectData;
    }

    private set projectTranslationData(data: ProjectTranslationData) {
        this.projectData = data;
    }

    private checkTextNodeId(row): boolean {
        return (
            this.projectData?.translation?.length > 0 &&
            this.projectData?.dbTextNodeId === row['data']?.['db_text_node_id']
        );
    }

    resetError() {
        this.translationText = this.selectedNodes?.[0]?.['data']?.translation ?? this.translationText;
        this.textNodeErrors = this.textNodeErrors.filter((error) => error === 'Placeholder Error');
        this.isLengthError = this.textNodeErrors.length > 0 || this.isTranslationCheckError;
    }

    resetMappedStatus() {
        this.mappingService.filterMappingPropData = [];
    }

    countDoneTextNodesForStructure(parents) {
        parents?.forEach((item) => {
            let count = item?.data?.doneCount;
            if (this.selectedRow['data']['state'] === 'Done') {
                count += 1;
            }
            if (this.selectedRow['data']['state'] !== 'Done' && count > 0) {
                count -= 1;
            }
            item.data.state = `${count}/${item?.data?.nodeCount}`;
            item.data.doneCount = count;
        });
    }

    getLanguageCode(role, props) {
        switch (role) {
            case Roles['editor']:
                return {
                    code: props?.editorLanguageCode,
                    id: props?.editorLanguageId,
                };
            case Roles['translator']:
                return {
                    code: props?.sourceLangCode,
                    id: props?.sourceLanguageId,
                };
            case Roles['proofreader']:
                return {
                    code: props?.proofreaderLangCode,
                    id: props?.proofreaderLangId,
                };
            case Roles['reviewer']:
                return {
                    code: props?.reviewerLangCode,
                    id: props?.reviewerLangId,
                };

            default:
                return undefined;
        }
    }

    getTextNodeState(textNode: TreeNode): string {
        if (this.translationSourceType === 'structure') {
            return textNode['data']['state'];
        } else {
            return this.textNodeState;
        }
    }
    private detectChangesInTranslation(state, done, isNext, stateFromConfirmation) {
        const dialogRef = this.commentsDialogService.openCommentDialog(this.LanguageCode, this.languageId);
        dialogRef.onClose.subscribe((response: CommentsModel) => {
            const comments = response?.comments.filter(
                (comment) => comment.languageId === response.textNode.languageId
            );
            if (comments?.length > 0) {
                this.commentsDialogService.setCommentState(comments);
                this.commentsDialogService.foreignLanguageChanged = false;
                this.changeState(state, done, isNext, stateFromConfirmation);
            }
            if (this.statusConfirmedInPopup && !this.isContextMenuVisible) {
                Object.assign(this.selectedRow?.['data'], this.oldSelectedRow);
            }
        });
    }

    getLabelChecks(): LabelCheckModel[] {
        let labelChecks: LabelCheckModel[] = [];
        if (this.translationSourceType === TranslationViewType.structure) {
            const labels = this.selectedRow['data']['labels'];
            labelChecks = this.getLabelChecksData(labels);
        } else {
            const labels = this.selectedRow['language_data']
                .find((languageData) => languageData.language_code === this.LanguageCode)
                ['language_props']?.find((properties) => properties.prop_name === 'Labels')?.value;
            labelChecks = this.getLabelChecksData(labels);
        }
        return labelChecks ?? [];
    }

    setConfigForProject(): void {
        this.getTranslationCheckConfig().subscribe((config: TranslationCheckConfigModel) => {
            this.config = config;
        });
    }

    private getLabelsChecksData(label: LabelModel): LabelCheckModel {
        return {
            condition: label.restriction,
            value: label.restrictionPattern,
            type: TranslationCheckType.Warning,
        };
    }

    getTranslationCheckConfig() {
        const url = `project-translation-check-config/${this.getProjectParameters().projectId}`;
        return this.apiService.getRequest<TranslationCheckConfigModel>(url);
    }

    getLabelChecksData(labels: LabelModel[]): LabelCheckModel[] {
        const labelChecks: LabelCheckModel[] = [];
        labels
            ?.filter((label) => !!label.restriction)
            .forEach((label) => {
                labelChecks.push(this.getLabelsChecksData(label));
            });
        return labelChecks;
    }

    private getOtherTranslations(dbTextNodeId: string, languageCode: string, translationRequestId: number) {
        const payload: ConsistencyCheckRequestModel = { dbTextNodeId, languageCode, translationRequestId };
        this.apiService
            .postTypeRequest('get-other-translations', payload)
            .subscribe((response: ApiBaseResponseModel) => {
                this.translationTexts = response?.data ?? [];
            });
    }

    updateTextNodeLabels() {
        if (
            this.translationSourceType === TranslationViewType.structure &&
            this.projectData?.dbTextNodeId === this.selectedRow['data']['db_text_node_id']
        ) {
            this.projectData?.languageGroup.forEach((languageGroup) => {
                if (languageGroup.languageId === this.languageId) {
                    this.selectedRow['data']['labels'] = languageGroup.labels;
                }
            });
        } else {
            if (this.projectData?.dbTextNodeId === this.selectedRow['db_text_node_id']) {
                this.projectData?.languageGroup.forEach((languageGroup) => {
                    if (languageGroup.languageId === this.languageId) {
                        this.labels(languageGroup.labels);
                    }
                });
            }
        }
    }

    private labels(labels: LabelOperations[]) {
        this.selectedRow['language_data']
            .find((item) => item.language_code === this.selectedLanguageCode)
            .language_props.find((lang) => lang?.prop_name === 'Labels').value = labels;
    }

    isWorkInProgressOrDoneMenuOptionVisible(selectedTreeNode): boolean {
        return (
            (!!this.translationText &&
                !this.areUnresolvedCharsInTextNode() &&
                selectedTreeNode?.data?.Id &&
                !selectedTreeNode?.data?.elementId) ||
            !this.isLengthError
        );
    }

    isViewGroup(node: TreeNode): boolean {
        return node?.data?.Type === NodeLevelType.View;
    }

    isReviewer(): boolean {
        return Roles[this.role] === Roles.reviewer;
    }

    isExceptionTextNode(selectedTreeNode): boolean {
        console.warn(selectedTreeNode);
        return true;
    }

    approveRejectView(status) {
        this.reviewerTranslationService.approveRejectView(status);
    }

    openCommentDialog() {
        const commentDialogRef: DynamicDialogRef = this.dialogService.open(
            OverlayPanelComponent,
            this.getDialogDefaultConfig()
        );
        commentDialogRef.onClose.subscribe((comment) => {
            this.reviewerTranslationService.approveRejectView(TextNodeStatus.Rejected, comment);
        });
    }

    private isEditorLanguage(): boolean {
        return !this.selectedRow?.['data']?.['ID'] && this.selectedRow?.['data']?.['language_id'] === this.languageId;
    }

    private getDialogDefaultConfig() {
        return {
            footer: ' ',
            modal: true,
            closable: false,
            autoZIndex: true,
            maximizable: false,
            width: '35vw',
            minX: 10,
            minY: 10,
            draggable: true,
            data: { dialogHeading: OverlayHeaders.reviewComment, isBulkUpdate: true },
        };
    }
    private isTextNodeInWorkOrDone(node): boolean {
        return node.state === TranslationStatus.WorkInProgress || node.state === TranslationStatus.Done;
    }

    private createTextNodePayloadForUpdate(node: TreeNode, props, nodeType: string) {
        //TODOWe need to handle All length Related when we cover length calculation for Copy-Paste
        return {
            node_id: node.data.TextNodeId ?? node.data.ID,
            translation_text: node.data.translation,
            language_code: this.getLanguage(node, props, nodeType),
            translation_status: node.data.state,
            array_item_index: this.checkIfEqualUnderScore(node.data.array_item_index),
            variant_id: this.checkIfEqualUnderScore(node.data.variant_id),
            unresolvedChars: [],
            width: 0,
            lines: 0,
        };
    }
    private getTranslationIdIfNotEditor(): number {
        return Roles.editor !== this.getProjectParameters().role
            ? this.getProjectParameters().translationRequestId
            : null;
    }
    private getLanguage(node, props, nodeType): string {
        return nodeType === NodeLevelType.Parent
            ? props.role === Roles.editor
                ? props?.editorLanguageCode
                : props?.sourceLangCode
            : node.data.context;
    }

    isTextNodeOrForeignLanguageNode(node: TreeNode): boolean {
        return node?.data?.TextNodeId || node?.data?.ID;
    }

    getLcPath(node: TreeNode): string {
        return this.translationSourceType === TranslationViewType.structure
            ? node?.['data']?.['lcPath']
            : node?.['lcPath'];
    }
    getLcId(node: TreeNode): string {
        return this.translationSourceType === TranslationViewType.structure
            ? node?.['data']?.['lengthCalculatorId']
            : node?.['lengthCalculatorId'];
    }

    getFontPath(): string {
        const fontPath = this.getCalculateLengthRequiredParms?.fontDir?.replace(
            new RegExp(this.LCServerPath, 'g'),
            environment.lcUrl + 'fonts/'
        );
        return fontPath + '/' + this.fontName + '.ttf';
    }

    inheritParentPropertiesToChildLanguages(state: string) {
        const selectedNode = this.selectedNodes[0];
        if (selectedNode?.data?.language_id > 0) {
            if (this.selectedRow['children']) {
                const inhertanceLanguages = this.selectedRow['children'].filter(
                    (item) => item.data.languageParentId === this.selectedRow['data'].language_id
                );
                this.changeChildLangaugesProperties(inhertanceLanguages, this.selectedRow['children'], state);
            } else {
                this.checkInhertanceLanguage(
                    this.selectedRow['data'].language_id,
                    this.selectedRow['parent'].children,
                    state
                );
            }
        } else {
            const childLanguages = this.getInhertanceLanguagesOfEditorLanguage();
            const inheritanceLanguages =
                childLanguages?.length > 0 ? childLanguages : this.getInhertanceChildLangauges();
            this.changeChildLangaugesProperties(inheritanceLanguages, this.selectedRow['children'], state);
        }
    }

    changeChildLangaugesProperties(inhertanceLanguages, sourceLanguages, state: string): void {
        inhertanceLanguages?.forEach((node) => {
            if (!node.data.isException) {
                node.data.translation = this.translationText;
                if (this.state !== TranslationStatus.Done) {
                    node.data.state = state;
                }
                this.checkInhertanceLanguage(node.data.language_id, sourceLanguages, state);
            }
        });
    }
    updateExceptionStatus(isException) {
        this.selectedRow['data']['isException'] = !isException;
        if (isException) {
            this.updateChildToParentStatusUnExceptionCase();
        }
        const status =
            this.selectedRow['data']['state'] === TranslationStatus.Done
                ? (this.selectedRow['data']['state'] = TranslationStatus.WorkInProgress)
                : this.selectedRow['data']['state'];
        this.changeTextnodeStatus(this.selectedRow, status, this.selectedRow['data'].translation)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res: ApiBaseResponseModel) => {
                    if (res?.status === ResponseStatusEnum.OK) {
                        if (this.translationSourceType !== 'Table') this.eventBus.cast('structure:textnodeupdate', res);
                    }
                },
            });
    }

    getChildLanguages(): SelectedTextNodeChildLanguages[] {
        const selectedNode = this.selectedNodes[0];
        const languageId = selectedNode?.data?.language_id;
        if (!languageId) {
            return [];
        }
        const children = selectedNode.children || selectedNode.parent?.children || [];
        return children
            .filter((data) => data.data.languageParentId === languageId)
            .map((item) => ({ context: item.data.context, selectedNode: selectedNode }));
    }

    getParentLanguage(): SelectedTextNodeChildLanguages[] {
        const selectedNode = this.selectedNodes[0];
        if (selectedNode?.data?.language_id <= 0) {
            return [];
        }

        const parentLanguageId = selectedNode?.data?.languageParentId;
        if (this.projectService?.getProjectProperties()?.editorLanguageId === parentLanguageId) {
            const editorLanguageCode = this.projectService.getProjectProperties().editorLanguageCode;
            return [
                {
                    context: editorLanguageCode,
                },
            ];
        }

        const children = selectedNode?.children || selectedNode?.parent?.children || [];
        return children
            .filter((data) => data.data.language_id === parentLanguageId)
            .map((item) => ({ context: item.data.context }));
    }

    getParentInhertanceLanguages(languageId: number, sourceLanguages) {
        return sourceLanguages?.filter((child) => child.data.languageParentId === languageId) ?? [];
    }

    checkInhertanceLanguage(languageId, sourceLanguages, state: string) {
        const inhertanceLanguages = this.getParentInhertanceLanguages(languageId, sourceLanguages);
        if (inhertanceLanguages) this.changeChildLangaugesProperties(inhertanceLanguages, sourceLanguages, state);
    }

    getTextNodeType(): string {
        return this.getParentTextNodeType() ?? this.selectedRow?.['text_type'];
    }

    getSourceText(): string {
        return this.getParentSourceText() ?? this.selectedRow?.['source_text'];
    }

    private getParentSourceText(): string {
        return this.translationSourceType === TranslationViewType.structure && this.selectedRow?.['data']?.['ID']
            ? this.selectedRow?.['parent']?.data.context
            : this.selectedRow?.['data']?.context;
    }

    private getParentTextNodeType(): string {
        return this.translationSourceType === TranslationViewType.structure && this.selectedRow?.['data']?.['ID']
            ? this.selectedRow?.['parent']?.['data']?.text_node_type
            : this.selectedRow?.['data']?.text_node_type;
    }

    private updateTextAndStateInStructureView(id: number, state: string, text: string, children: TreeNode[]) {
        for (const child of children) {
            if (child.data.TextNodeId && child.data.db_text_node_id === id) {
                child.data['state'] = state;
                child.data['translation'] = text;
                break;
            }
            if (child.children) {
                this.updateTextAndStateInStructureView(id, state, text, child.children);
            }
        }
    }

    private updateChildToParentStatusUnExceptionCase() {
        const props = this.getProjectParameters();
        if (props.role === Roles.translator) {
            this.updateTranslation(this.selectedRow['data'].context);
        } else {
            this.isMatchedParentLanguage()
                ? this.updateTranslation(this.selectedRow['parent']?.data.translation)
                : this.updateTranslationFromChild();
        }
    }

    private updateTranslation(transaltion) {
        this.selectedRow['data'].translation = transaltion;
        this.selectedRow['data'].state = TranslationStatus.WorkInProgress;
    }

    private isMatchedParentLanguage(): boolean {
        return this.selectedRow['parent']?.data?.language_id === this.selectedRow['data']?.languageParentId;
    }
    private updateTranslationFromChild() {
        const matchedChildern = this.selectedRow['parent'].children
            .filter((data) => data.data.language_id === this.selectedRow['data']?.languageParentId)
            .map((item) => ({
                context: item.data.context,
                translation: item.data.translation,
                state: item.data.state,
            }));

        matchedChildern.length > 0 && this.updateTranslation(matchedChildern[0].translation);
    }

    getInhertanceChildLangauges() {
        return this.selectedRow?.['children']?.filter(
            (item) => item.data.languageParentId === this.selectedRow?.['data'].language_id
        );
    }

    getInhertanceLanguagesOfEditorLanguage() {
        return this.selectedRow?.['parent']?.children.filter(
            (item) => item.data.languageParentId === this.selectedRow?.['data'].language_id
        );
    }
}
