import { LogLevel, TextNodeStatus, TranslationSource, TranslationViewType } from 'src/Enumerations';
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, debounceTime, take, takeUntil } from 'rxjs';
import { GlobalConstants } from 'src/Constants';
import { Roles, Status, TranslationRoleEnum, TranslationStatus, UnresolvedSymbols, tableIcons } from 'src/Enumerations';
import { TranslationCheckService } from 'src/app/core/services/check/translation-check.service';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { CompressDecompressService } from 'src/app/core/services/project/project-translation/grammar-parser/compress-decompress.service';
import { GrammarParserService } from 'src/app/core/services/project/project-translation/grammar-parser/grammar-parser.service';
import { PlaceholderService } from 'src/app/core/services/project/project-translation/placeholder.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { ProofreaderTranslationService } from 'src/app/core/services/project/project-translation/proofreader-translation.service';
import { ReviewerTranslationService } from 'src/app/core/services/project/project-translation/reviewer-translation.service';
import { SpellcheckService } from 'src/app/core/services/project/project-translation/spellcheck/spellcheck.service';
import { StcDetailsService } from 'src/app/core/services/project/project-translation/stc-details.service';
import { TextNodeService } from 'src/app/core/services/project/project-translation/text-node.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { LocalStorageService } from 'src/app/core/services/storage/local-storage.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { CheckDataModel } from 'src/app/shared/models/check/check-data-model.model';
import { SeverityLevel, TranslationCheck } from 'src/app/shared/models/check/transaltion-check.enum';
import { FillRateCondition, TranslationCheckModel } from 'src/app/shared/models/check/translation-check.model';
import { SelectedTextNodeChildLanguages } from 'src/app/shared/models/project/projectTranslate';
import {
    SpellCheckRequestInitModel,
    suggestionsRequestModel,
} from 'src/app/shared/models/spell-check/spellcheck.model';
import { ApiPlaceholderGetResponseModel } from '../../../../shared/models/placeholder/api-placeholder-get-response.model';
import { FontCharacterComponent } from '../font-characters/font-character.component';
import { GrammarParserComponent } from '../grammmar-parser/grammar-parser.component';
import { PlaceholderDialogModel, PlaceholderViewModel } from '../placeholder-detail-dialog/placeholder-dialog.model';
import { PlaceholderTransformer } from '../placeholder-detail-dialog/placeholder.transformer';
import { RTETranslationPlaceholderModel } from './rich-text-editor/models/rte-translation-placeholder.model';
@Component({
    selector: 'app-text-editor',
    templateUrl: './text-editor.component.html',
    styleUrls: ['./text-editor.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class TextEditorComponent implements OnInit, OnDestroy {
    sourceText: string;
    translationText: string;
    maxRows: number;
    maxChars: number;
    textEditorDirection = 'auto';
    math = Math;
    changedBy;
    lastChange;
    isTextMapped = true;
    editorLanguage: string;
    foreginLangCode: string;
    statusIcon = Status;
    expandFlag = false;
    isStcVesrion;
    showStcVHistory = false;
    selectstcVHistory;
    projectDetails;
    translationRoleEnum = TranslationRoleEnum;
    unresolvedSymbols = UnresolvedSymbols;
    tableIcons = tableIcons;
    destroyed$ = new Subject<boolean>();
    placeholders: PlaceholderViewModel[] = [];
    placeholderDetails: PlaceholderDialogModel;
    lineBreakCount = 5;
    proofreaderOrReviewerComment;
    isStatusDone = false;
    proofreaderSourceLanguage;
    proofreaderLanguage;
    placeholderLogs: TranslationCheckModel[] = [];
    placeholderRegex: RegExp;
    role: number;
    isEditor: boolean;
    isTranslator: boolean;
    isProofreader: boolean;
    isReviewer: boolean;
    sourceLanguage = '';
    warningCount = 0;
    progressBarError: boolean;
    progressBarWarning: boolean;
    parentLanguage = '';
    isInheritParentPropertiesToChildLanguages = false;
    isTextNodeLanguage = false;
    isStatusNotUnworked = false;
    showConfirmationLanguageInheritance = false;
    unMarkedExceptionInheritanceMessage =
        "This text is currently marked as an exception from it's inheritance relationship and contains manual changes. When deactivating the exception status, all manual changes will be lost and overwritten with the values of the parent language. Are you sure you want to proceed?";
    markedExceptionInheritanceMessage =
        "This text is currently inheriting it's translation and attributes from another language. By marking it as an exception, this reference will be removed and changes of the parent language will no longer be reflected on this text. Are you sure you want to proceed ?";

    unnamedRegex: RegExp;
    namedRegex: RegExp;
    placeholderIdentifiers: RTETranslationPlaceholderModel[];
    showUnsupportedCharactersDialogue = false;
    unsupportedSymbols = [];
    isPlaceholderButtonsVisible: boolean;
    translationSource = TranslationSource;
    spellCheckWords: string[];

    handleLinkToShowUnsupportedCharactersClicked(unsupportedSymbols: string[]) {
        this.unsupportedSymbols = unsupportedSymbols;
        this.showUnsupportedCharactersDialogue = true;
    }

    inheritanceLanguages: SelectedTextNodeChildLanguages[] = [];
    constructor(
        private eventBus: NgEventBus,
        private datePipe: DatePipe,
        public projectTranslationService: ProjectTranslationService,
        public mappingService: MappingService,
        public stcDetailsService: StcDetailsService,
        public confirmationService: ConfirmationService,
        private messageService: MessageService,
        private localStorageService: LocalStorageService,
        private placeholderService: PlaceholderService,
        private userService: UserService,
        private proofreaderTranslationService: ProofreaderTranslationService,
        private reviewerTranslationService: ReviewerTranslationService,
        private textNodeService: TextNodeService,
        private projectService: ProjectService,
        private translationCheckService: TranslationCheckService,
        private dialogService: DialogService,
        private cdr: ChangeDetectorRef,
        private readonly grammarParserService: GrammarParserService,
        private readonly compressDecompressService: CompressDecompressService,
        private readonly spellcheckService: SpellcheckService
    ) {}

    ngOnInit(): void {
        this.initializeRoles();

        const props = this?.projectTranslationService?.getProjectParameters();
        this.placeholderRegex = this.placeholderService.getPlaceholderRegex(props);
        this.role = this.userService.getUser()?.role;
        this.proofreaderSourceLanguage = props?.proofreaderSourceLanguage;
        this.proofreaderLanguage = props?.proofreaderLangCode;
        this.editorLanguage = props?.editorLanguageCode;
        this.sourceLanguage = this.isEditor ? GlobalConstants.Dev : this.editorLanguage;
        if (this.isProofreader || this.isReviewer) {
            this.projectTranslationService.activeEditorOptions.readonly = true;
        } else {
            this.projectTranslationService.activeEditorOptions.readonly = false;
        }
        this.onLoad();
        this.observeTranslationTextState();
        this.eventBus.cast('texteditor:primengservises', {
            confirmationService: this.confirmationService,
            messageService: this.messageService,
        });
        this.translationCheck();
        this.grammarParserService.connectSocket();
        this.grammarParserService.initializeGrammarParser();
        this.spellcheckService.socketConnect();
        this.spellcheckService.initSocketListeners();
        const language = JSON.parse(localStorage.getItem('projectProps')).editorLanguageCode;
        this.spellcheckService.initializeSpellcheck(this.initializeSpellcheckPayload(language));
        this.getSpellCheckWords();
        this.insertSuggestionsText();
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.projectTranslationService.progressBarWidth = 0;
        this.projectTranslationService.calculateWidthByLengthCalculation = 0;
        this.projectTranslationService.linesWidth = [];
        this.projectTranslationService.translationText = '';
        this.grammarParserService.disconnectSocket();
        this.spellcheckService.handleSuggestions([]);
    }

    onLoad() {
        //TODO: HMIL-5622
        // Get text onType
        //TODO: HMIL-5733
        this.eventBus
            .on('translate:textareaValue')
            .pipe(debounceTime(400), takeUntil(this.destroyed$))
            .subscribe({
                next: async (res: MetaData) => {
                    this.projectTranslationService.selectedNodes.push(this.projectTranslationService.selectedRow);
                    this.projectTranslationService.translationText = res?.data;
                    if (!this.projectTranslationService.selectedRow?.['data']?.['isReferenceLanguage']) {
                        this.projectTranslationService.textChanged = true;
                        this.projectTranslationService.textNodeErrors =
                            this.projectTranslationService.textNodeErrors.filter(
                                (error) =>
                                    error === TranslationStatus.UnResolvedFont || error === TranslationStatus.Error
                            );
                        this.projectTranslationService.checkMaxCharacterMaxLength(
                            this.projectTranslationService.selectedRow
                        );
                        this.projectTranslationService.isSaveButtonDisabled = true;
                        if (
                            this.projectTranslationService.translationText !==
                            this.projectTranslationService.oldTranslationText
                        ) {
                            this.projectTranslationService.isSaveButtonDisabled = false;
                        }
                        if (
                            !!this?.projectTranslationService?.maxWidth &&
                            this.translationRoleEnum[
                                this.projectTranslationService?.getCalculateLengthRequiredParms?.translateRole
                            ] === 'Constrained'
                        ) {
                            if (
                                this.projectTranslationService.translationText !==
                                this.projectTranslationService.oldTranslationText
                            ) {
                                this.projectTranslationService.isSaveButtonDisabled = false;
                            }

                            if (
                                !!this.projectTranslationService?.progressBarWidth &&
                                this.projectTranslationService?.progressBarWidth > 100
                            ) {
                                this.projectTranslationService.setTextNodeLengthStatus(
                                    this.projectTranslationService.selectedRow,
                                    true,
                                    'Length Error'
                                );
                            } else {
                                this.projectTranslationService.setTextNodeLengthStatus(
                                    this.projectTranslationService.selectedRow
                                );
                            }
                        }
                        if (
                            !!this.projectTranslationService.maxCharacters &&
                            this.translationRoleEnum[
                                this.projectTranslationService?.getCalculateLengthRequiredParms?.translateRole
                            ] === 'Constrained'
                        ) {
                            if (
                                this.projectTranslationService.maxCharacters <
                                    this.projectTranslationService.translationText?.length &&
                                (!this.projectTranslationService.isCurrentTranslationWidthInLimit() ||
                                    !this.projectTranslationService.isCurrentTranslationNoOfLineInLimit())
                            ) {
                                if (this.projectTranslationService.oldSelectedRow['state'] === 'Unresolved font') {
                                    return;
                                }
                                this.projectTranslationService.setTextNodeLengthStatus(
                                    this.projectTranslationService.selectedRow,
                                    true,
                                    'Length Error'
                                );
                            } else {
                                if (
                                    !this.projectTranslationService.isCurrentTranslationWidthInLimit() ||
                                    !this.projectTranslationService.isCurrentTranslationNoOfLineInLimit()
                                ) {
                                    return;
                                }
                                this.projectTranslationService.setTextNodeLengthStatus(
                                    this.projectTranslationService.selectedRow
                                );
                            }
                        }
                        this.projectTranslationService.setProjectTranslationData();
                        const checkDataModel: CheckDataModel = {
                            labelCheckData: this.projectTranslationService.getLabelChecks(),
                            punctuationCheckData: {
                                sourceString: this.sourceText,
                            },
                            consistencyCheckData: {
                                TranslationTexts: this.projectTranslationService.translationTexts,
                            },
                        };

                        this.projectTranslationService.isTranslationCheckError = false;
                        this.translationCheckService.validate(
                            res?.data,
                            this.projectTranslationService.config,
                            checkDataModel,
                            !this.isPreviousTranslationMadeEmptyAndNotMapped() || this.isNotUnworked()
                        );
                        this.showTranslationCheckLogs();
                        this.spellCheckWordsOnType();
                        this.grammarParserService.handleGrammarParserCheck();
                        this.showPlaceholderLogOrSetTextNodeState();
                    }
                },
            });

        this.eventBus
            .on('translateData:translateObj')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res: MetaData) => {
                    this.unnamedRegex = this.placeholderService.generateRegularExpressionForSelectedTextNode(
                        this.projectTranslationService.selectedRow
                    );
                    this.namedRegex = this.placeholderService.generateNamedRegularExpressionForSelectedTextNode(
                        this.projectTranslationService.selectedRow,
                        'placeholder'
                    );
                    this.placeholderIdentifiers = this.placeholderService.getPlaceholderIdentifiers(
                        this.projectTranslationService.selectedRow
                    );

                    const project = this.projectService.getProjectProperties();
                    let dbTextNodeId = undefined;
                    if (res?.data?.type === 'table') {
                        dbTextNodeId = res?.data?.rowData?.db_text_node_id;
                    } else {
                        dbTextNodeId = res?.data?.treeNode?.data?.db_text_node_id;
                    }
                    if (dbTextNodeId)
                        this.textNodeService.setTextNodeState({
                            projectId: project?.projectId,
                            dbTextNodeId,
                            languageCode: this.languageCode(res?.data?.translateObj?.foreginLangCode),
                            role: Roles[project.role],
                        });

                    this.sourceText = res?.data?.translateObj?.source ?? '';
                    this.projectTranslationService.textNodeErrors.length = 0;
                    this.translationText = res?.data?.translateObj?.translation ?? '';
                    this.projectTranslationService.lastTranslationText = this.translationText;
                    if (
                        this.isProofreader ||
                        this.isReviewer ||
                        this.projectTranslationService.selectedRow?.['data']?.['isReferenceLanguage']
                    ) {
                        this.projectTranslationService.activeEditorOptions.readonly = true;
                        if (res.data?.treeNode?.data?.['Id']) {
                            this.projectTranslationService.translationText = '';
                        } else {
                            this.projectTranslationService.translationText = res?.data?.translateObj?.translation;
                        }

                        if (res?.data?.type === 'table') {
                            if (res?.data?.['translateObj']?.['state'] === 'Done') {
                                this.isStatusDone = true;
                            } else {
                                this.isStatusDone = false;
                            }
                        } else {
                            if (res.data?.treeNode?.data?.state === 'Done') {
                                this.isStatusDone = true;
                            } else {
                                this.isStatusDone = false;
                            }
                        }
                    } else {
                        if (res.data?.treeNode?.data['TextNodeId'] || res.data?.treeNode?.data['ID']) {
                            this.projectTranslationService.activeEditorOptions.readonly = true;
                        } else {
                            this.projectTranslationService.activeEditorOptions.readonly = false;
                        }

                        if (res?.data?.type === 'table') {
                            this.maxChars =
                                res?.data.rowData.max_characters === '_' ? null : res?.data.rowData.max_characters;

                            this.projectTranslationService.maxWidth =
                                res?.data.rowData.max_width === '_' ? null : res?.data.rowData.max_width;

                            const lockStatus = res?.data.editorLangWiseDataFromAPI?.language_props.find(
                                (item) => item.prop_name === 'Locked'
                            )?.value;

                            let state = res?.data.editorLangWiseDataFromAPI?.language_props.find(
                                (item) => item.prop_name === 'State'
                            ).value;

                            if (lockStatus == 'Locked') {
                                this.projectTranslationService.isTextnodeLocked = true;
                            } else {
                                this.projectTranslationService.isTextnodeLocked = false;
                            }

                            if (state != 'Unworked') {
                                this.changedBy = res.data?.treeNode?.data?.user;

                                this.lastChange = this.datePipe.transform(
                                    res.data?.treeNode?.data?.translation_lastchange,
                                    'yyyy-MM-dd, hh:mm:ss a'
                                );
                            } else {
                                this.changedBy = null;

                                this.lastChange = null;
                            }

                            this.sourceText = res?.data?.translateObj?.source ?? '';

                            this.projectTranslationService.translationText = res?.data?.translateObj?.translation;

                            this.foreginLangCode = res?.data?.translateObj?.foreginLangCode;

                            this.projectTranslationService.state = res?.data?.translateObj?.state;

                            this.projectTranslationService.activeEditorOptions.readonly =
                                this.stcDetailsService.activeEditorOptionsreadonly;

                            if (this?.projectTranslationService?.progressBarWidth > 100) {
                                state = 'Length error';
                            }
                        } else {
                            this.projectTranslationService.maxWidth =
                                res.data?.treeNode?.data?.max_width === '_' ||
                                res.data?.treeNode?.parent?.data?.max_width === '_'
                                    ? null
                                    : res?.data?.treeNode?.data?.max_width ||
                                      res?.data?.treeNode?.parent?.data?.max_width;

                            if (
                                res.data.treeNode.data.max_characters !== '_' ||
                                !res?.data?.treeNode?.data.max_characters
                            ) {
                                this.maxChars = res.data.treeNode.data.max_characters;
                            } else {
                                this.maxChars = null;
                            }

                            if (res.data?.treeNode?.data?.locked == 'Locked') {
                                this.projectTranslationService.isTextnodeLocked = true;
                            } else {
                                this.projectTranslationService.isTextnodeLocked = false;
                            }

                            if (
                                res.data?.treeNode?.data?.state != 'Unworked' &&
                                res.data?.treeNode?.data['TextNodeId' || 'ID']
                            ) {
                                this.changedBy = res.data?.treeNode?.data?.user;
                                this.lastChange = this.datePipe.transform(
                                    res.data?.treeNode?.data?.translation_lastchange,
                                    'yyyy-MM-dd, hh:mm:ss a'
                                );
                            } else {
                                this.changedBy = null;

                                this.lastChange = null;
                            }

                            this.sourceText = res?.data?.translateObj?.source;

                            this.projectTranslationService.translationText = res?.data?.translateObj?.translation;

                            this.foreginLangCode = res?.data?.translateObj?.foreginLangCode;
                            this.projectTranslationService.selectedLanguageCode =
                                res?.data?.translateObj?.foreginLangCode;

                            this.projectTranslationService.state = res?.data?.translateObj?.state;

                            this.projectTranslationService.activeEditorOptions.readonly =
                                this.stcDetailsService.activeEditorOptionsreadonly;
                        }
                        if (
                            res.data?.treeNode?.data?.state != 'Unworked' &&
                            res.data?.treeNode?.data['TextNodeId' || 'ID']
                        ) {
                            this.changedBy = res.data?.treeNode?.data?.user;

                            this.lastChange = this.datePipe.transform(
                                res.data?.treeNode?.data?.translation_lastchange,
                                'yyyy-MM-dd, hh:mm:ss a'
                            );
                        } else {
                            this.changedBy = null;
                            this.lastChange = null;
                        }
                        this.sourceText = res?.data?.translateObj?.source ?? '';
                        this.projectTranslationService.translationText = res?.data?.translateObj?.translation;
                        this.foreginLangCode = res?.data?.translateObj?.foreginLangCode;
                        this.projectTranslationService.selectedLanguageCode = res?.data?.translateObj?.foreginLangCode;
                        this.projectTranslationService.state = res?.data?.translateObj?.state;
                        this.projectTranslationService.activeEditorOptions.readonly =
                            this.stcDetailsService.activeEditorOptionsreadonly;
                        /* Child language have exception */
                        const data = res?.data?.treeNode?.data;
                        const isException = (this.projectTranslationService.isException = data?.isException);
                        const languageParentId = (this.projectTranslationService.languageParentId =
                            data?.languageParentId);

                        if (!isException && languageParentId > 0) {
                            this.projectTranslationService.activeEditorOptions.readonly = true;
                        }
                        this.parentLanguage = this.projectTranslationService?.getParentLanguage()[0]?.context;
                        this.isInheritParentPropertiesToChildLanguages = this.hasParentLanguage();
                        this.isTextNodeLanguage = this.hasTextNodeLanguage(res?.data?.treeNode?.data);
                        /*Child language have exception */

                        const placeholders = this.getPlaceholdersAccordingTextnode(res);
                        this.placeholders = PlaceholderTransformer.mapToManyViewModels(placeholders);
                    }

                    if (!this.projectTranslationService.selectedRow?.['data']?.['isReferenceLanguage']) {
                        this.projectTranslationService.resetLengthCalulationParms();
                        this.checkFontName();

                        const checkDataModel: CheckDataModel = {
                            labelCheckData: this.projectTranslationService.getLabelChecks(),
                            punctuationCheckData: {
                                sourceString: this.sourceText,
                            },
                            consistencyCheckData: {
                                TranslationTexts: this.projectTranslationService.translationTexts,
                            },
                        };

                        this.projectTranslationService.isTranslationCheckError = false;
                        this.isStatusNotUnworked =
                            res?.data?.['translateObj']?.['state'] === 'Done' ||
                            res?.data?.['translateObj']?.['state'] === 'Work in progress' ||
                            res?.data?.['translateObj']?.['state'] === 'Error';
                        this.translationCheckService.validate(
                            this.projectTranslationService.translationText,
                            this.projectTranslationService.config,
                            checkDataModel,
                            !this.isPreviousTranslationMadeEmptyAndNotMapped() || this.isStatusNotUnworked
                        );
                    }
                    !!this.projectTranslationService.translationText &&
                        this.grammarParserService.handleGrammarParserCheck();
                    this.showTranslationCheckLogs();

                    this.setEditorReadOnlyForPostponeLabel(this.projectTranslationService.selectedRow);
                    this.isPlaceholderButtonsVisible =
                        this.projectTranslationService.selectedRow?.['data']?.isReferenceLanguage;
                    this.inheritanceLanguages = this.projectTranslationService.getChildLanguages();
                    this.spellcheckService.initializeSpellcheck(this.initializeSpellcheckPayload(this.foreginLangCode));
                    this.spellCheckWordsOnType();
                    this.showPlaceholderLogOrSetTextNodeState();
                },
            });

        this.eventBus.on('mapping:changetextaftermapping').subscribe({
            next: (res: MetaData) => {
                this.projectTranslationService.translationText = res.data.data.translation;
                if (this?.projectTranslationService?.translationText) {
                    this.projectTranslationService.checkMaxCharacterMaxLength(
                        this.projectTranslationService.selectedRow
                    );
                }
            },
        });

        this.eventBus.on('mapping:changetextaftermappingFromTable').subscribe({
            next: (res: MetaData) => {
                this.stcDetailsService.headerIdealText = res.data?.form ?? '';
                this.projectTranslationService.translationText = res.data?.translationText ?? '';
                if (this?.projectTranslationService?.translationText) {
                    this.projectTranslationService.checkMaxCharacterMaxLength(
                        this.projectTranslationService.selectedRow
                    );
                }
            },
        });

        this.eventBus.on('changedetection:translationText').subscribe({
            next: (res: MetaData) => {
                this.projectTranslationService.translationText = res.data;
            },
        });

        this.eventBus.on('idMapNewVersion:idMapNewVersionTextNode').subscribe({
            next: (res: any) => {
                this.projectDetails = JSON.parse(localStorage.getItem('projectProps'));
                this.isStcVesrion = res._data;

                if (!!this.isStcVesrion['getstcversion'] && this.isStcVesrion['getstcversion']?.length > 0) {
                    this.selectstcVHistory = this.isStcVesrion['getstcversion'][0];
                }
            },
        });

        this.eventBus.on('placeholder:longestValueUpdate').subscribe((response: MetaData) => {
            this.placeholderIdentifiers = this.placeholderIdentifiers.map((placeholder) => {
                placeholder.isLongestValueUpdated = false;
                if (placeholder.identifier === response?.data.identifier) {
                    placeholder.longestCaseValue = response?.data.longestCaseValue;
                    placeholder.isLongestValueUpdated = true;
                }
                return placeholder;
            });
        });
    }

    handlePlaceholderEvent(identifier: any) {
        const clickedPlaceholder = this.placeholders.find(
            (placeholder: PlaceholderViewModel) => placeholder.identifier === identifier
        );
        clickedPlaceholder && this.showPlaceholderDetailsDialog(clickedPlaceholder);
    }

    showVersionData() {
        this.showStcVHistory = true;
    }

    onRowClick(data) {
        this.selectstcVHistory = data;
    }

    mapNewVersion() {
        let payload = {};
        if (this.isStcVesrion.nodeData.type === 'table') {
            payload = {
                project_id: this.projectDetails?.projectId,
                version_id: this.projectDetails?.version,
                stc_master_id: this.selectstcVHistory.stc_id,
                textnode_id: this.isStcVesrion?.nodeData?.rowData?.text_node_id,
                variant_id: this.isStcVesrion?.nodeData?.rowData?.variant_id,
                array_item_index: this.isStcVesrion?.nodeData?.rowData?.array_item_index,
            };
        } else {
            payload = {
                project_id: this.projectDetails?.projectId,
                version_id: this.projectDetails?.version,
                stc_master_id: this.selectstcVHistory.stc_id,
                textnode_id: this.isStcVesrion?.nodeData?.data?.TextNodeId
                    ? this.isStcVesrion?.nodeData?.data?.TextNodeId
                    : this.isStcVesrion?.nodeData?.data?.ID,
                variant_id: this.isStcVesrion?.nodeData?.data?.variant_id,
                array_item_index: this.isStcVesrion?.nodeData?.data?.array_item_index,
            };
        }
        this.mappingService.mapNewVersionData(payload).subscribe((res: any) => {
            if (res.status == 'OK') {
                if (
                    this.isStcVesrion.nodeData.type === 'table' &&
                    this.projectTranslationService.tableValue.length > 0
                ) {
                    this.updateStcTranslationTextForTable();
                }
                this.updateStcTranslationText(this.projectTranslationService.expandedGroup);
                this.eventBus.cast('structure:textnodeupdate', res);
                this.showStcVHistory = false;
            }
        });
    }

    private updateStcTranslationText(children: TreeNode[]) {
        for (const child of children) {
            if (
                child.data.parent_stc_id === +this.selectstcVHistory.stc_id ||
                child.data.stc_master_id === +this.selectstcVHistory.stc_id
            ) {
                child.data.translation = this.selectstcVHistory.new_value;
            }
            if (child.children) {
                this.updateStcTranslationText(child.children);
            }
        }
    }

    private updateStcTranslationTextForTable(): void {
        this.projectTranslationService.tableValue.forEach((table) => {
            table.language_data.find((language) => {
                if (
                    language.language_code === this.editorLanguage &&
                    language.parent_stc_id === +this.selectstcVHistory.stc_id
                ) {
                    language.language_props.find((item) => item.prop_name == 'Text').value =
                        this.selectstcVHistory.new_value;
                }
            });
        });
    }

    checkFontName() {
        this.setLengthCalculateParamater();
        this.projectTranslationService.progressBarWidth = 0;
        this.projectTranslationService.calculateWidthByLengthCalculation = 0;
        this.projectTranslationService.linesWidth = [];
        if (
            this.translationRoleEnum[this.projectTranslationService?.getCalculateLengthRequiredParms?.translateRole] ===
                'Constrained' &&
            this.projectTranslationService.selectedRow['data']?.fontType !== 'Raster'
        ) {
            if (this.isLcCheckEnabled()) {
                this.projectTranslationService.setTextNodeLengthStatus(
                    this.projectTranslationService.selectedRow,
                    true,
                    'Error'
                );
            } else {
                if (
                    this.projectTranslationService.areFontPropsAvailableInLengthCalculation() &&
                    this.projectTranslationService.getCalculateLengthRequiredParms?.lcFile !== '_'
                ) {
                    if (this.areFontType()) this.projectTranslationService.checkResolveFont();
                }
                if (this.projectTranslationService.fontName === '_' && this.projectTranslationService?.fontFileId > 0) {
                    this.projectTranslationService.setFontUnresolveError(this.projectTranslationService.selectedRow);
                }
            }
        } else {
            this.projectTranslationService.calculateLength(this.projectTranslationService.selectedRow);
            this.projectTranslationService.fontIsUnresloved = false;
        }
    }

    setLengthCalculateParamater() {
        if (Object.keys(this.projectTranslationService.getCalculateLengthRequiredParms).length === 0) {
            this.projectTranslationService.setCalculateLengthRequiredParms = JSON.parse(
                this.localStorageService.get('calculateWordLineBreakPayload')
            );
        }
        if (!this.projectTranslationService.translationRole) {
            this.projectTranslationService.translationRole = +this.localStorageService.get('translation_role');
        }
    }

    areFontType() {
        const selectedRow = this.projectTranslationService.selectedRow;
        const fontType =
            this.projectTranslationService.translationSourceType === 'Table'
                ? this.projectTranslationService.selectedRow['fontType']
                : this.projectTranslationService.selectedRow['data']?.fontType;
        const lcPath =
            this.projectTranslationService.translationSourceType === TranslationViewType.structure
                ? selectedRow?.['data']?.['lcPath']
                : selectedRow?.['lcPath'];
        return fontType !== '_' && fontType !== 'Raster' && lcPath !== '_';
    }

    getState() {
        if (this.projectTranslationService?.translationSourceType === 'Table') {
            return this.projectTranslationService?.tableSelectedRow?.language_data
                ?.find((item) => item.language_code === this.editorLanguage)
                ?.language_props.find((properties) => properties?.prop_name === 'State').value;
        } else {
            return this.projectTranslationService?.selectedRow?.['data']?.['state'];
        }
    }

    showPlaceholderDetailsDialog(placeholder: PlaceholderViewModel) {
        this.placeholderDetails = {
            placeholder: placeholder,
            visible: true,
        };
        this.cdr.detectChanges();
    }

    accept(status): void {
        if (this.role === Roles.proofreader) {
            this.proofreaderTranslationService.changeTextnodeStatus(status);
        }
        if (this.role === Roles.reviewer) {
            this.reviewerTranslationService.changeTextnodeStatus(status);
        }
    }

    reset(): void {
        if (this.role === Roles.proofreader) {
            this.proofreaderTranslationService.changeTextnodeStatus(TextNodeStatus.Pending);
        }
        if (this.role === Roles.reviewer) {
            this.reviewerTranslationService.changeTextnodeStatus(TextNodeStatus.Pending);
        }
    }

    private showPlaceholderLogs(
        placeholderRegex: RegExp,
        placeholders: PlaceholderViewModel[],
        translationText: string,
        role: number
    ) {
        const placeholderLogs = [];
        if (placeholderRegex) {
            const placeholdersInTranslationText = translationText
                .match(placeholderRegex)
                ?.filter((placeholder) => placeholder);

            const removedPlaceholderLogs = this.getRemovedPlaceholderLogs(
                placeholders,
                placeholdersInTranslationText,
                role
            );
            if (removedPlaceholderLogs) placeholderLogs.push(removedPlaceholderLogs);
            const unknownPlaceholderLogs = this.getUnknownPlaceholderLogs(placeholdersInTranslationText, placeholders);
            if (unknownPlaceholderLogs) placeholderLogs.push(unknownPlaceholderLogs);
            const multipleDefinitionPlaceholderLogs =
                this.getMultipleDefinitionPlaceholderLogs(placeholdersInTranslationText);
            if (multipleDefinitionPlaceholderLogs) placeholderLogs.push(multipleDefinitionPlaceholderLogs);

            const invalidPlaceholderAttributesLogs = this.getInvalidPlaceholderAttributesLogs(
                placeholders,
                placeholdersInTranslationText
            );
            if (invalidPlaceholderAttributesLogs) placeholderLogs.push(invalidPlaceholderAttributesLogs);
        }
        return placeholderLogs;
    }

    private getRemovedPlaceholderLogs(
        placeholders: PlaceholderViewModel[],
        placeholdersInTranslationText: string[],
        role: number
    ) {
        const removedPlaceholdersFromTranslationText = placeholders.filter(
            (placeholder) => !placeholdersInTranslationText?.includes(placeholder.identifier)
        );
        const messageType = role === Roles.editor ? LogLevel.Warning : LogLevel.Error;
        return (
            removedPlaceholdersFromTranslationText?.length > 0 &&
            this.getErrorMessage(messageType, 'Not all placeholder added in translation')
        );
    }
    private getUnknownPlaceholderLogs(placeholdersInTranslationText: string[], placeholders: PlaceholderViewModel[]) {
        const addedPlaceholdersInTranslationText = placeholdersInTranslationText?.filter(
            (translationPlaceholder) =>
                !placeholders?.some((placeholder) => placeholder.identifier === translationPlaceholder)
        );
        return (
            addedPlaceholdersInTranslationText?.length > 0 &&
            this.getErrorMessage(LogLevel.Error, 'Extra placeholder added in translation')
        );
    }
    private getMultipleDefinitionPlaceholderLogs(placeholdersInTranslationText: string[]) {
        const uniquePlaceholderArray = [
            ...new Set(
                placeholdersInTranslationText?.map((translationPlaceholder) =>
                    translationPlaceholder.replace(/\d+/g, '')
                )
            ),
        ];
        return (
            uniquePlaceholderArray.length > 1 &&
            this.getErrorMessage(LogLevel.Error, 'More than one definition placeholder added in translation')
        );
    }
    private getErrorMessage(logLevel: LogLevel, message: string): TranslationCheckModel {
        return {
            type: TranslationCheck.Placeholder,
            message,
            logLevel,
        };
    }

    private getPlaceholdersAccordingTextnode(res: any) {
        let placeholders = [];
        if (this.projectTranslationService.translationSourceType === 'structure') {
            const textNodeData = res?.data?.treeNode;
            placeholders = textNodeData?.data?.placeholders
                ? (textNodeData?.data?.placeholders as ApiPlaceholderGetResponseModel[])
                : (textNodeData?.parent?.data?.placeholders as ApiPlaceholderGetResponseModel[]);
        } else {
            placeholders = res?.data?.rowData?.placeholders;
        }
        return placeholders;
    }

    saveStatusDone(isNext) {
        if (this.userService.getUser()?.role === Roles.translator) {
            this.proofreaderTranslationService.changeTextnodeStatus(2);
        }
        if (this.warningCount > 0) {
            this.translationCheckWarning(isNext);
        } else {
            if (isNext === 'Next') this.projectTranslationService.changeState('Done', 0, true);
            else this.projectTranslationService.changeState('Done');
        }
    }

    private initializeRoles() {
        this.isEditor = this.projectTranslationService.getProjectParameters()?.role === Roles.editor;
        this.isProofreader = this.projectTranslationService.getProjectParameters()?.role === Roles.proofreader;
        this.isTranslator = this.projectTranslationService.getProjectParameters()?.role === Roles.translator;
        this.isReviewer = this.projectTranslationService.getProjectParameters()?.role === Roles.reviewer;
    }
    isDoneSaveDisable() {
        return (
            this.projectTranslationService.isTextnodeLocked ||
            this.projectTranslationService.isLengthError ||
            this.projectTranslationService.hasUnresolvedCharacters ||
            this.projectTranslationService.fontIsUnresloved ||
            (this.projectTranslationService.isSaveButtonDisabled &&
                this.projectTranslationService.state === TranslationStatus.Done) ||
            this.projectTranslationService.state === TranslationStatus.Unworked ||
            this.projectTranslationService.translationText === '' ||
            this.projectTranslationService.selectedRow?.['data']?.isReferenceLanguage
        );
    }
    isPreviousTranslationMadeEmptyAndNotMapped(): boolean {
        return (
            this.projectTranslationService.isLengthError ||
            !(
                this.isPreviousOrCurrentTranslationAvailable() &&
                this.isPreviousTranslationExists() &&
                !this.stcDetailsService.isTextMapped
            )
        );
    }

    isWorkInProgressSaveDisable() {
        return (
            this.projectTranslationService.isTextnodeLocked ||
            this.projectTranslationService.isLengthError ||
            this.projectTranslationService.hasUnresolvedCharacters ||
            this.projectTranslationService.fontIsUnresloved ||
            (this.projectTranslationService.isSaveButtonDisabled &&
                this.projectTranslationService.state === TranslationStatus.WorkInProgress) ||
            this.projectTranslationService.state === TranslationStatus.Unworked ||
            this.projectTranslationService.translationText === '' ||
            this.projectTranslationService.selectedRow?.['data']?.isReferenceLanguage
        );
    }

    private isPreviousOrCurrentTranslationAvailable(): boolean {
        return !!(
            this.projectTranslationService?.oldTranslationText || this.projectTranslationService?.translationText
        );
    }

    private isPreviousTranslationExists(): boolean {
        return (
            this.projectTranslationService?.oldTranslationText?.length > 0 &&
            this.projectTranslationService?.translationText?.length === 0 &&
            this.projectTranslationService?.oldTranslationText !== '_'
        );
    }

    private getInvalidPlaceholderAttributesLogs(
        placeholders: PlaceholderViewModel[],
        placeholdersInTranslationText: string[]
    ) {
        const invalidPlaceholderAttributes = placeholders.filter(
            (placeholder) =>
                placeholdersInTranslationText?.includes(placeholder.identifier) &&
                this.placeholderService.validate(placeholder.dataTypeModelId, placeholder.longestCaseValue).field !== ''
        );
        return (
            invalidPlaceholderAttributes.length > 0 &&
            this.getErrorMessage(
                LogLevel.Error,
                'Longest case value of placeholder does not match the defined data type'
            )
        );
    }

    private showPlaceholderLogOrSetTextNodeState(): void {
        if (this.projectTranslationService.translationText) {
            this.placeholderLogs = this.showPlaceholderLogs(
                this.placeholderRegex,
                this.placeholders,
                this.projectTranslationService.translationText,
                this.role
            );
        } else {
            this.placeholderLogs = [];
            this.setTextNodeState(false);
        }
        this.translationCheckService.setPlaceholderLogs(this.placeholderLogs);
    }

    private setTextNodeState(isError: boolean): void {
        const selectedState = this.projectTranslationService.textNodeState;
        const state = isError
            ? LogLevel.Error
            : selectedState !== 'Done' && selectedState === 'Error'
            ? this.getTextStatus(selectedState)
            : selectedState;
        this.projectTranslationService.setTextNodeStatus(isError, state, this.projectTranslationService.selectedRow);
    }

    private languageCode(languageCode: string): string {
        const project = this.projectService.getProjectProperties();
        switch (this.role) {
            case Roles.reviewer:
                return project.proofreaderLangCode;
            case Roles.proofreader:
                return project.proofreaderLangCode;
            default:
                return languageCode;
        }
    }

    private showTranslationCheckLogs() {
        this.warningCount = 0;
        this.translationCheckService.getTranslationCheckState().subscribe((response: TranslationCheckModel[]) => {
            this.projectTranslationService.isTranslationCheckError =
                response.filter((error) => error.logLevel === SeverityLevel.Error).length > 0;
            this.warningCount = response.filter((error) => error.logLevel === SeverityLevel.Warning).length;
            this.setTextNodeState(this.projectTranslationService.isTranslationCheckError);
        });
    }

    private translationCheckWarning(isNext: string): void {
        this.confirmationService.confirm({
            message: `${this.warningCount} of those checks have resulted in a warning. Are you sure you want to set the status to 'Done'?`,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (isNext === 'Next') {
                    this.projectTranslationService.changeState('Done', 0, true);
                } else {
                    this.projectTranslationService.changeState('Done');
                }
            },
        });
    }

    isSpeechAndPromptInEditorNotVisible(): boolean {
        return (
            !this.projectTranslationService.isSpeechEditorVisible &&
            !this.projectTranslationService.isPromptEditorVisible
        );
    }

    private translationCheck(): void {
        this.translationCheckService
            .getProgressBarValue()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: FillRateCondition) => {
                this.progressBarError = response.error;
                this.progressBarWarning = response.warning;
            });
    }

    private setEditorReadOnlyForPostponeLabel(row) {
        if (this.projectTranslationService.translationSourceType === TranslationViewType.structure) {
            if (row.data?.labels?.find((label) => !!label.date)) {
                this.projectTranslationService.activeEditorOptions.readonly = true;
            }
        } else {
            const labels = this.projectTranslationService.selectedRow['language_data']
                .find((item) => item.language_code === this.projectTranslationService.selectedLanguageCode)
                .language_props.find((lang) => lang?.prop_name === 'Labels').value;
            if (labels?.find((label) => !!label.date)) {
                this.projectTranslationService.activeEditorOptions.readonly = true;
            }
        }
    }

    private getTextStatus(textStatus: string): string {
        return this.projectTranslationService?.translationText?.length > 0
            ? TranslationStatus.WorkInProgress
            : textStatus;
    }

    showCharacters() {
        const fontCharacterDialogRef = this.dialogService.open(FontCharacterComponent, {
            header: 'Symbols',
            width: '30vw',
            data: {
                fontUrl: this.projectTranslationService.getFontPath(),
            },
        });

        fontCharacterDialogRef.onClose.pipe(take(1)).subscribe((selectedCharacter: string) => {
            if (selectedCharacter) {
                this.translationText = this.projectTranslationService.translationText + selectedCharacter;
                this.eventBus.cast(
                    'translate:textareaValue',
                    (this.projectTranslationService.translationText += selectedCharacter ?? '')
                );
            }
        });
    }

    setComment(comment: string) {
        if (this.role === Roles.proofreader) {
            this.proofreaderTranslationService.changeTextnodeStatus(TextNodeStatus.Rejected, comment);
        }
        if (this.role === Roles.reviewer) {
            this.reviewerTranslationService.changeTextnodeStatus(TextNodeStatus.Rejected, comment);
        }
    }

    isSymbolVisible(): boolean {
        if (this.projectTranslationService?.selectedRow)
            return !(
                this.projectTranslationService.getTextNodeState(this.projectTranslationService.selectedRow) ===
                    TranslationStatus.UnResolvedFont ||
                !this.projectTranslationService.getCalculateLengthRequiredParms?.fontDir ||
                this.projectTranslationService.fontName === '_'
            );

        return false;
    }

    private isLcCheckEnabled(): boolean {
        return (
            this.projectTranslationService.getLcPath(this.projectTranslationService.selectedRow) === '_' &&
            this.projectTranslationService.getLcId(this.projectTranslationService.selectedRow) !== '_' &&
            !!this.projectTranslationService.getLcId(this.projectTranslationService.selectedRow)
        );
    }

    private hasParentLanguage(): boolean {
        return (
            this.projectTranslationService.getParentLanguage() &&
            this.projectTranslationService.getParentLanguage().length > 0
        );
    }

    private hasTextNodeLanguage(textNode): boolean {
        return textNode.language_id && textNode.language_id !== '';
    }

    createShortForm() {
        this.projectTranslationService.createShortForm();
        if (!this.projectTranslationService.activeEditorOptions.readonly) {
            this.translationText = '';
        }
    }
    updateExceptionStatus() {
        this.showConfirmationLanguageInheritance = true;
        this.confirmationService.confirm({
            message: !this.projectTranslationService.isException
                ? this.markedExceptionInheritanceMessage
                : this.unMarkedExceptionInheritanceMessage,
            header: 'Confirmation-Language Inheritance',
            accept: () => {
                this.projectTranslationService.updateExceptionStatus(this.projectTranslationService?.isException);
                this.showConfirmationLanguageInheritance = false;
            },
            reject: () => {
                this.showConfirmationLanguageInheritance = false;
            },
        });
    }

    // Undo and Redo state management
    storePrevTranslationTextState(prevTranslationTextState: string) {
        this.projectTranslationService.lastTranslationText = prevTranslationTextState;
    }

    private observeTranslationTextState() {
        this.projectTranslationService.translationTextState$.subscribe((response: string) => {
            // TODO: this hack is added to update when one letter is added to existing translation as translationText does not get updated on quill editor chagne
            // Will handle this issue with Text-editor and project translation service refactoring
            if (this.translationText === response) {
                this.translationText = response + ' ';
            } else {
                this.translationText = response;
            }
        });
    }

    isNotUnworked() {
        return (
            this.projectTranslationService.state === TranslationStatus.Done ||
            this.projectTranslationService.state === TranslationStatus.WorkInProgress ||
            this.projectTranslationService.state === TranslationStatus.Error
        );
    }

    private spellCheckWordsOnType() {
        this.spellcheckService.translationTextSpellcheck();
    }

    private getSpellCheckWords() {
        this.spellcheckService
            .getSpellcheck()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((suggestions) => {
                this.spellCheckWords = suggestions;
            });
    }

    private insertSuggestionsText() {
        this.spellcheckService
            .getInsertText()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((text) => {
                this.eventBus.cast('translate:textareaValue', text);
                this.translationText = text;
            });
    }

    handleSuggestionEvent(text: string) {
        const spellCheckPayload: suggestionsRequestModel = {
            languageCode: this.foreginLangCode,
            userId: this.userService.getUser().id,
            word: text,
        };
        this.spellCheckWords?.includes(text) && this.spellcheckService.suggestions(spellCheckPayload);
    }

    openGrammarParserPanel() {
        this.compressDecompressService.setUtterancesState({ utteranceCount: 0, utterances: [] });
        this.dialogService.open(GrammarParserComponent, {
            header: 'Speech Command Assistant',
            width: '60%',
            height: '80%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: false,
            data: { selectedRow: this.projectTranslationService.selectedRow },
        });
    }

    isSpeechTextNode(): boolean {
        return this.projectTranslationService.isSpeechEditorVisible;
    }

    private initializeSpellcheckPayload(language: string): SpellCheckRequestInitModel {
        return {
            languageCode: language,
            userId: this.userService.getUser().id,
            projectId: (this.projectDetails = JSON.parse(localStorage.getItem('projectProps'))).projectId,
        };
    }
}
