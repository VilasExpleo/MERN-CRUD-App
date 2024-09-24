import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message } from 'primeng/api';
import { TextNodeStatus, TranslationStatus, TranslationViewStatus, TranslationViewType } from 'src/Enumerations';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { SelectedTextNodeChildLanguages } from 'src/app/shared/models/project/projectTranslate';
import {
    NodeStatusModel,
    StatusFlagsModel,
    TableStatusModel,
    TranslationStatusBarModel,
} from './translation-status-bar.model';
import { TranslationStatusBarTransformer } from './translation-status-bar.transformer';
@Component({
    selector: 'app-translation-status-bar',
    templateUrl: './translation-status-bar.component.html',
    providers: [ConfirmationService],
})
export class TranslationStatusBarComponent implements OnInit {
    data: TranslationStatusBarModel;
    tableData: TableStatusModel;
    textNodeStatus = TextNodeStatus;
    translationViewStatus = TranslationViewStatus;
    translationViewType = TranslationViewType;
    statusNotAvailable: string;
    msgs: Message[] = [];
    statusFlag: StatusFlagsModel;
    @Input()
    showChildLanguages: SelectedTextNodeChildLanguages[];
    isChildLanguagesVisible = false;

    @HostBinding('class')
    classes = 'm-1';

    @Output()
    openGrammarParserEvent = new EventEmitter();

    @Input()
    isSpeechTextNode: boolean;

    constructor(
        public projectTranslationService: ProjectTranslationService,
        private translationStatusBarTransformer: TranslationStatusBarTransformer,
        private confirmationService: ConfirmationService,
        private eventBus: NgEventBus
    ) {
        this.getSelectedTextNodeData();
    }

    ngOnInit(): void {
        // onselect textNode
        this.eventBus.on('translateData:translateObj').subscribe({
            next: () => {
                this.getSelectedTextNodeData();
            },
        });
    }

    getSelectedTextNodeData() {
        this.statusNotAvailable = this.projectTranslationService.statusNotAvailable;
        if (
            this.projectTranslationService?.translationSourceType.toLocaleLowerCase() === TranslationViewType.structure
        ) {
            this.data = this.translationStatusBarTransformer.transform(
                this.projectTranslationService.structureSelectedRow?.['data']
            );
        } else {
            const sourceLanguage = this.projectTranslationService.tableSelectedRow?.language_data.filter(
                (e) => e.language_code === this.projectTranslationService?.selectedLanguageCode
            )[0]?.language_props;
            this.tableData = {
                proofread_status: sourceLanguage?.find((item) => item.prop_name === 'Proofread Status')?.value,
                proofread_comment: sourceLanguage?.find((item) => item.prop_name === 'Proofread Comment')?.value,
                review_comment: sourceLanguage?.find((item) => item.prop_name === 'Review Comment')?.value,
                review_status: sourceLanguage?.find((item) => item.prop_name === 'Review Status')?.value,
                screen_review_status: sourceLanguage?.find((item) => item.prop_name === 'ScreenReview Status')?.value,
                screen_review_comment: sourceLanguage?.find((item) => item.prop_name === 'ScreenReview Comment')?.value,
                languageWiseLabels: sourceLanguage?.find((item) => item.prop_name === 'Labels')?.value,
            };
            this.data = this.translationStatusBarTransformer.transform(this.tableData);
        }
        this.statusFlag = this.setRejectedStatusFlags(this.data);
    }

    checkStatus(status: string): boolean {
        return status.toLowerCase() === this.translationViewStatus.rejected;
    }

    confirm() {
        const postponeLabelName = this.data.name;

        if (this.data?.date) {
            this.confirmationService.confirm({
                message: `The label '${postponeLabelName}' is attached to the text node. Do you still want to edit the text node?`,
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.projectTranslationService.activeEditorOptions.readonly = false;
                },
                reject: () => {
                    this.projectTranslationService.activeEditorOptions.readonly = true;
                },
            });
        }
    }

    private setRejectedStatusFlags(statusObject: NodeStatusModel): StatusFlagsModel {
        return {
            isProofreadRejected: statusObject.proofReadStatus === TranslationStatus.Rejected,
            isReviewRejected: statusObject.reviewerStatus === TranslationStatus.Rejected,
            isScreenReviewRejected: statusObject.screenReviewStatus === TranslationStatus.Rejected,
        };
    }

    onSelectLanguage(event, element): void {
        this.eventBus.cast('structure:onLanguageSelect', event.value);
        element.hide(event);
    }

    openGrammarParser() {
        this.openGrammarParserEvent.emit();
    }
}
