import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { QuillEditorComponent } from 'ngx-quill';
import { TreeNode } from 'primeng/api';
import { DeltaStatic, RangeStatic, Sources, StringMap } from 'quill';
import Delta from 'quill-delta/lib/delta';
import 'quill-mention';

import { Subject, delay, of, takeUntil } from 'rxjs';
import { StringUtilityService } from 'src/app/core/services/string-utility.service';
import { LeftSidebarModel } from './components/left-sidebar/left-sidebar.model';
import { TranslationStatisticsModel } from './components/translation-statistics/translation-statistics.model';
import { RTETranslationColorEnum } from './enum/rich-text-editor.enum';
import { RTETranslationConfigurationModel } from './models/rte-translation-configuration.model';
import {
    RTETranslationConstructionModel,
    RangeModel,
    SubStringRangeModel,
} from './models/rte-translation-construction.model';
import { RTETranslationPlaceholderModel } from './models/rte-translation-placeholder.model';
import { LineBreakMode, RichEditorOptions } from './rich-text-editor.model';
import { RTETranslationAutocompleteService } from './services/rte-translation-autocomplete.service';
import { RTETranslationConfigurationService } from './services/rte-translation-configuration.service';
import { RTETranslationConstructionService } from './services/rte-translation-construction.service';
import { RTETranslationLengthCalculationService } from './services/rte-translation-length-calculation.service';
import { RTETranslationPlaceholderService } from './services/rte-translation-placeholder.service';

@Component({
    selector: 'app-rich-text-editor',
    templateUrl: './rich-text-editor.component.html',
    styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('editor', { static: false }) editor: QuillEditorComponent;
    @Input() lineBreakMode!: LineBreakMode;
    @Input() text: string;
    @Input() selectedRow: TreeNode;
    @Input() unresolvedSymbols: string[];
    @Input() maxWidth: number;
    @Input() maxRows: number;
    @Input() maxCharacters: number;
    @Input() isSourceText: boolean;
    @Input() isSpeechEditorVisible: boolean;
    @Input() isPromptEditorVisible: boolean;
    @Input() linesWidth: number[];
    @Input() unnamedRegex: RegExp;
    @Input() namedRegex: RegExp;
    @Input() placeholderIdentifiers: RTETranslationPlaceholderModel[];
    @Input() errorNewlinePositions: number[];
    @Input() options: RichEditorOptions = {};
    @Input() spellCheckWords: string[];

    @Output() clickLinkEvent = new EventEmitter();
    @Output() showUnresolvedSymbolsDialogEvent = new EventEmitter<string[]>();
    @Output() prevTranslationStateEvent = new EventEmitter<string>();
    @Output() clickSuggestionEvent = new EventEmitter();

    leftSidebarStatistics: LeftSidebarModel;
    translationStatistics: TranslationStatisticsModel;
    standardTextTransformations: RTETranslationConfigurationModel;
    quillModule;

    private endSubscription$ = new Subject<void>();

    constructor(
        private readonly element: ElementRef,
        private readonly eventBus: NgEventBus,
        private readonly stringUtilityService: StringUtilityService,
        private readonly rteTranslationConfigurationService: RTETranslationConfigurationService,
        private readonly rteTranslationConstructionService: RTETranslationConstructionService,
        private readonly rteTranslationLengthCalculationService: RTETranslationLengthCalculationService,
        private readonly rteTranslationAutocompleteService: RTETranslationAutocompleteService,
        private readonly rteTranslationPlaceholderService: RTETranslationPlaceholderService
    ) {
        this.standardTextTransformations = this.rteTranslationConfigurationService.configuration();
    }

    ngOnInit() {
        this.quillModule = {
            toolbar: false,
        };
        if (!this.isSourceText) this.quillModule['mention'] = this.rteTranslationAutocompleteService.getMentionConfig();
    }

    ngOnDestroy(): void {
        this.editor.quillEditor.getModule('mention')?.openMenu('');
        this.endSubscription$.next();
        this.endSubscription$.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Please don't change the order or calls
        // Step 1: Set the placeholder regex
        this.setPlaceholderRegex(changes);

        // Step 2: Set translation text

        this.setTranslationText(changes?.['text']?.currentValue);
        this.calculateStatistics(changes);
        this.reactOnLCServerResponse(changes);
        this.reactOnSpellcheckResponse(changes);
        this.updatePlaceholderLongestValue(changes);
    }

    /**
     * This initialization method creates subscriptions for:
     * - The copy event
     * - The text-change event
     * - The selection-change event
     */
    ngAfterViewInit() {
        this.editor.elementRef.nativeElement.addEventListener('copy', this.reactToCopyingEvent);
        this.setTranslationText(this.text);
        this.translationStatistics = this.getTranslationStatistics();
        this.leftSidebarStatistics = this.getLeftSidebarStatistics();
        of(null)
            .pipe(delay(1000), takeUntil(this.endSubscription$))
            .subscribe(() => {
                this.editor.quillEditor.on('text-change', (delta, oldContents, source) =>
                    this.reactToTextChange(delta, oldContents, source)
                );
                this.editor.quillEditor.on('selection-change', (range, oldRange, source) =>
                    this.reactToSelectionChange(range, oldRange, source)
                );
            });

        this.editor.elementRef.nativeElement.addEventListener('click', () => {
            const quill = this.editor.quillEditor;
            const range = quill.getSelection(true);
            const selectedWord = this.rteTranslationAutocompleteService.getWordAtIndex(
                range.index,
                quill.getLength(),
                this.getCleanEditorText()?.split(/\s+/) || []
            );
            this.clickSuggestionEvent.emit(selectedWord);
        });
    }

    showUnresolvedSymbolDialog() {
        this.showUnresolvedSymbolsDialogEvent.emit(this.unresolvedSymbols);
    }

    private updatePlaceholderLongestValue(changes: SimpleChanges) {
        if (changes?.['placeholderIdentifiers']?.currentValue) {
            const range: RangeModel = this.rteTranslationPlaceholderService.placeholderRange(
                changes?.['placeholderIdentifiers']?.currentValue,
                this.getCleanEditorText()
            );
            range && this.applyTextToLinkTransformation(range, this.getRawEditorText());
        }
    }

    private charactersCount() {
        // TODO: Verify with Ivan about adding \n as to remove from source text ex: "Hello \n"
        return this.editor?.quillEditor?.getText()?.replace(/[¶⏎](?!\n$)|[¶⏎]\n|\n(?=$)/g, '').length ?? 0;
    }
    private wordsCount() {
        return (
            this.editor.quillEditor
                ?.getText()
                ?.replace(/[¶⏎]/g, '')
                ?.split(/\s+|•+/)
                ?.filter((val) => val !== '')?.length ?? 0
        );
    }

    private setPlaceholderRegex(changes: SimpleChanges) {
        if (changes['selectedRow']) {
            this.editor?.quillEditor.setText(this.text ?? '');
            if (this.unnamedRegex) {
                this.standardTextTransformations.placeholder.unnamedRegex = this.unnamedRegex;
            }
            if (this.namedRegex) {
                this.standardTextTransformations.placeholder.namedRegex = this.namedRegex;
            }
        }
    }

    private setTranslationText(text: string) {
        if (this.stringUtilityService.isNotNullAndUndefined(text) && this.editor?.quillEditor?.setText) {
            this.editor.quillEditor.setText(text);
        }
    }

    private calculateStatistics(changes: SimpleChanges) {
        // TODO: how max width could change on LCserver response. Please check?
        if (changes['linesWidth'] || changes['maxWidth'] || changes['unresolvedSymbols'] || changes['text']) {
            this.translationStatistics = this.getTranslationStatistics();
            this.leftSidebarStatistics = this.getLeftSidebarStatistics();
        }
    }

    private reactOnLCServerResponse(changes: SimpleChanges) {
        const filteredNewlinePositions = this.rteTranslationLengthCalculationService.filterWordLineBreakServerResponse(
            changes['errorNewlinePositions']?.currentValue || [],
            this.getCleanEditorText()
        );

        if (filteredNewlinePositions.length > 0) {
            this.integrateWordLineBreakServerResponse(filteredNewlinePositions);
        }
    }

    private reactOnSpellcheckResponse(changes: SimpleChanges) {
        this.spellCheckWords = changes['spellCheckWords']?.currentValue || [];
        this.spellcheckHighlight(this.spellCheckWords);
    }

    // Reacting methods
    private reactToTextChange(delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) {
        // Do not respond to changes initiated in this method
        if (source === 'silent') {
            return;
        }

        this.storePrevTranslationState(oldContents);
        this.spellcheckHighlight(this.spellCheckWords);
        // Construct the translation with spaces, paragraph, placeholder and enter symbol
        const constructTranslation = this.rteTranslationConstructionService.constructTranslation(
            delta,
            this.getRawEditorText(),
            this.editor.quillEditor.getSelection(false),
            this.placeholderIdentifiers,
            this.standardTextTransformations
        );

        // Render the translation into quill editor
        this.renderTranslation(constructTranslation);

        // Calculate translation statistics and left bar statistics
        this.translationStatistics = this.getTranslationStatistics();
        this.leftSidebarStatistics = this.getLeftSidebarStatistics();

        // Raise an event to get translations width calculation from LC server
        if (source === 'user') {
            this.eventBus.cast('translate:textareaValue', this.getCleanEditorText());
        }
        // Check the translation spellcheck that is currently available here.
    }

    private reactToSelectionChange(range, oldRange, source: string) {
        // Do not respond to changes initiated in this method
        if (source === 'silent') {
            return;
        }
        const userSelection = this.editor.quillEditor.getSelection(false);
        if (this.isCursorPositionRequiresUnshift(userSelection)) {
            userSelection.index--;
        }
        setTimeout(() => {
            // Put the cursor back in its correct position
            this.resetCursorInEditor(userSelection, 'silent');
        });
    }

    private isCursorPositionRequiresUnshift(userSelection: RangeStatic | null) {
        return (
            userSelection !== null &&
            this.stringUtilityService.charAtIndexIs(this.getRawEditorText(), '\n', userSelection.index) &&
            (this.stringUtilityService.charAtIndexIs(this.getRawEditorText(), '¶', userSelection.index - 1) ||
                this.stringUtilityService.charAtIndexIs(this.getRawEditorText(), '⏎', userSelection.index - 1)) &&
            userSelection.length === 0
        );
    }

    private reactToCopyingEvent(event) {
        event.clipboardData.setData(
            'text/plain',
            document.getSelection().toString().replace(/•/g, ' ').replace(/¶|⏎/g, '')
        );
        event.preventDefault();
    }

    // Placeholder method
    private handleLinkClicked(event: any) {
        event.preventDefault();
        this.clickLinkEvent.emit(event.target.innerHTML);
    }

    // Editor methods
    /**
     * Iteratively inserts substrings into the text editor at the specified indices.
     *
     * @param substringObjs - Array containing the substrings to insert, the indices at which to insert them,
     *      and the lengths of substrings to be removed from the editor beforehand
     * @param format - Object containing additional formatting options
     * @param user - User that is to have initiated the change
     */
    private applyChangesToEditorTextByIndex(substringObjs: SubStringRangeModel[], format: StringMap, user: Sources) {
        for (const substringObj of substringObjs) {
            this.editor.quillEditor.deleteText(substringObj.index, substringObj.length, user);
            this.editor.quillEditor.insertText(substringObj.index, substringObj.substring, format, user);
        }
    }

    private highlightRangeInEditor(index: number, length: number, user: Sources) {
        this.editor?.quillEditor.formatText(index, length, 'background', RTETranslationColorEnum.ROSE, user);
    }

    private unHighlightRangeInEditor(index: number, length: number, user: Sources) {
        this.editor?.quillEditor.formatText(index, length, 'background', false, user);
    }

    private underlineTextInEditor(index: number, length: number, user: Sources) {
        this.editor.quillEditor.formatText(index, length, 'underline', true, user);
    }

    private colorTextInEditor(index: number, length: number, user: Sources, color: string) {
        this.editor.quillEditor.formatText(index, length, 'color', color, user);
    }

    private resetCursorInEditor(cursorSelection: RangeStatic, user: Sources) {
        if (cursorSelection !== null) {
            this.editor.quillEditor.setSelection(cursorSelection.index, cursorSelection.length, user);
        }
    }

    private getRawEditorText(): string {
        return (
            this.editor?.quillEditor
                ?.getContents()
                ?.ops.filter((op) => op.insert && typeof op.insert === 'string')
                .map((op) => op.insert)
                .join('') ?? ''
        );
    }

    private getCleanEditorText(): string {
        return this.getRawEditorText()
            .replace(/•/g, ' ')
            .replace(/[¶⏎]/g, '')
            .replace(/\n(?=$)/g, '');
    }

    // Helper methods
    private getLeftSidebarStatistics(): LeftSidebarModel {
        return {
            textLines: this.getCleanEditorText().split('\n'),
            isSourceText: this.isSourceText,
            lineBreakMode: this.lineBreakMode,
            maxWidth: this.maxWidth,
            linesWidth: this.linesWidth,
            readOnly: !this.lineBreakMode || this.options.readonly,
        };
    }

    /**
     * This helper method recalculates the statistics beneath the text editor.
     */
    private getTranslationStatistics(): TranslationStatisticsModel {
        if (!this.editor) {
            return null;
        }
        return {
            isVisible: !this.isSpeechEditorVisible && !this.isPromptEditorVisible && !this.unresolvedSymbols?.length,
            isSourceText: this.isSourceText,
            lineBreakMode: this.lineBreakMode,
            maxCharacters: this.maxCharacters,
            maxRows: this.maxRows,
            maxWidth: this.maxWidth,
            nbCharacters: this.charactersCount(),
            nbRows: this.editor?.quillEditor?.getLines().length,
            nbWords: this.wordsCount(),
            unresolvedSymbols: this.unresolvedSymbols,
            linesWidth: this.linesWidth,
        };
    }

    private renderTranslation(translationConstruct: RTETranslationConstructionModel) {
        of(null).subscribe(() => {
            // If text was inserted, adjust the text in the editor and color meta characters blue
            if (translationConstruct.insertedSubstrings.length > 0) {
                this.applyChangesToEditorTextByIndex(
                    translationConstruct.insertedSubstrings,
                    { color: null },
                    'silent'
                );
                translationConstruct.blueRanges.forEach((o) =>
                    this.colorTextInEditor(o.index, o.length, 'silent', RTETranslationColorEnum.BLUE)
                );
                this.applyTextToLinksTransformation(
                    translationConstruct.placeholderRanges,
                    translationConstruct.originalText
                );
            }
            // If text was inserted or deleted, redo all highlighting
            this.unHighlightRangeInEditor(0, translationConstruct.modifiedText.length, 'silent');
            translationConstruct.toHighlight.forEach((i) => this.highlightRangeInEditor(i.index, i.length, 'silent'));
        });
        setTimeout(() => {
            // Set the cursor to write in black again and put it in its correct position
            this.editor.quillEditor.format('color', false, 'silent');
            this.resetCursorInEditor(translationConstruct.userSelection, 'silent');

            this.element.nativeElement.querySelectorAll('.ql-editor a').forEach((element: HTMLElement) => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                element.removeEventListener('click', () => {});
                element.addEventListener('click', this.handleLinkClicked.bind(this), false);
            });
        });
    }

    /**
     * Convert text to link from the complete text, for a given index and length,
     * @param links - Array containing the position and length of text to be converted into link from complete text string
     * @param completeText - Text inside the rich text editor
     * @example - Hello %1(Text) world -> Hello %1 (link -  on click, opens a dialog) world
     */
    private applyTextToLinksTransformation(links: RangeModel[], completeText: string) {
        for (const link of links) {
            this.applyTextToLinkTransformation(link, completeText);
        }
    }

    private applyTextToLinkTransformation(link: RangeModel, completeText: string) {
        const linkText = completeText.substring(link.index, link.index + link.length);
        this.editor.quillEditor.updateContents(
            new Delta()
                .retain(link.index)
                .delete(link.length)
                .insert(linkText, {
                    link: this.rteTranslationPlaceholderService.placeholderTooltip(
                        this.placeholderIdentifiers,
                        linkText
                    ),
                }),
            'silent'
        );
    }

    private storePrevTranslationState(oldContents: DeltaStatic) {
        this.prevTranslationStateEvent.emit(oldContents.ops[0]?.insert);
    }

    private integrateWordLineBreakServerResponse(newlineIndices: number[]) {
        newlineIndices.sort();
        const substringsForInserting = newlineIndices.map((e) => ({ index: e, length: 0, substring: '⏎\n' }));
        this.applyTransformationsToInsertions(
            substringsForInserting,
            this.rteTranslationConstructionService.mapStandardTextTransformation(
                this.standardTextTransformations,
                (transformation) => {
                    return {
                        regExp: transformation.unnamedRegex,
                        replacementStr: transformation.replacementString,
                    };
                }
            )
        );
        const substringsForMarking = [];
        substringsForInserting.forEach((e) =>
            substringsForMarking.push({ index: e.index, length: e.substring.length, substring: e.substring })
        );
        const redRanges = this.rteTranslationConstructionService.recordPatternMatchesInSubstrings(
            substringsForMarking,
            substringsForInserting.reduce((currentStr, currentSubstrObj) => {
                return this.stringUtilityService.replaceSubstringInString(
                    currentStr,
                    currentSubstrObj.index,
                    currentSubstrObj.length,
                    currentSubstrObj.substring
                );
            }, this.getRawEditorText()),
            /(?<par>⏎)/g,
            {
                par: { lengthOfReplacementStr: 1, recordReplacement: true },
            }
        );
        of(null).subscribe(() => {
            if (substringsForInserting.length > 0) {
                this.applyChangesToEditorTextByIndex(substringsForInserting, { color: null }, 'silent');
                redRanges.forEach((o) =>
                    this.colorTextInEditor(o.index, o.length, 'silent', RTETranslationColorEnum.RED)
                );
                const translationConstruct = this.rteTranslationConstructionService.constructTranslation(
                    this.editor.quillEditor.insertText(0, '', 'silent'),
                    this.getRawEditorText(),
                    this.editor.quillEditor.getSelection(false),
                    this.placeholderIdentifiers,
                    this.standardTextTransformations
                );
                this.renderTranslation(translationConstruct);
                this.translationStatistics = this.getTranslationStatistics();
                this.leftSidebarStatistics = this.getLeftSidebarStatistics();
            }
        });
    }

    /**
     * Adjusts the index and length of each element of the substring array to adjust to transformations to the complete text.
     * The substrings are assumed *not* to be part of the complete text and the length refers to the characters being removed
     * from the complete text starting with the given index.
     *
     * @param substringArr - Array containing strings, the indices at which they are to be inserted, and the length of the substring
     * being removed from the complete text, beginning with the index
     * @param completeText - The complete text to be modified
     * @param transformationArr - An array of disjoint transformations that dictates how the complete text is adjusted
     */
    private applyTransformationsToInsertions(
        substringArr: { index: number; length: number; substring: string }[],
        transformationArr: { [key: string]: { regExp: RegExp; replacementStr: string } }
    ) {
        let completeText = this.getCleanEditorText();
        for (const transformation of Object.values(transformationArr)) {
            let totalOffset = 0;
            for (let si = 0; si < substringArr.length; si++) {
                substringArr[si].index += totalOffset;
                transformation.regExp.lastIndex = si > 0 ? substringArr[si - 1].index + 1 : 0;
                let match = transformation.regExp.exec(completeText);
                while (match && match.index < substringArr[si].index) {
                    const replacementStr = transformation.replacementStr ?? match[0];
                    const offset = replacementStr.length - match[0].length;
                    totalOffset += offset;
                    substringArr[si].index += offset;
                    completeText = this.stringUtilityService.replaceSubstringInString(
                        completeText,
                        match.index,
                        match[0].length,
                        replacementStr
                    );
                    transformation.regExp.lastIndex = match.index + replacementStr.length;
                    match = transformation.regExp.exec(completeText);
                }
                while (match && match.index < substringArr[si].index + substringArr[si].length) {
                    const replacementStr =
                        transformation.replacementStr === null ? match[0] : transformation.replacementStr;
                    const offset = replacementStr.length - match[0].length;
                    completeText = this.stringUtilityService.replaceSubstringInString(
                        completeText,
                        match.index,
                        match[0].length,
                        replacementStr
                    );
                    substringArr[si].length += offset;
                    transformation.regExp.lastIndex = match.index + replacementStr.length;
                    match = transformation.regExp.exec(completeText);
                }
            }
        }
        let differenceOffset = 0;
        for (const element of substringArr) {
            element.index += differenceOffset;
            differenceOffset += element.substring.length - element.length;
        }
    }

    private spellcheckHighlight(spellCheckWords: string[]) {
        const originalText = this.editor?.quillEditor?.getText();
        this.unHighlightRangeInEditor(0, originalText?.length, 'silent');
        let position = -1;
        for (const incorrectWord of spellCheckWords) {
            while ((position = originalText?.indexOf(incorrectWord, position + 1)) !== -1) {
                this.highlightRangeInEditor(position, incorrectWord?.length, 'silent');
            }
        }
    }
}
