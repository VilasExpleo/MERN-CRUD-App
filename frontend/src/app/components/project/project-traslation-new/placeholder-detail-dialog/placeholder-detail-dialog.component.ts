import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { TreeNode } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { PlaceholderService } from '../../../../core/services/project/project-translation/placeholder.service';
import { PlaceholderDatatypePipe } from '../../../../shared/pipes/placeholder-datatype.pipe';
import { PlaceholderDataTypeEnum } from './placeholder-data-type.enum';
import { PlaceholderDialogModel, PlaceholderViewModel } from './placeholder-dialog.model';

@Component({
    selector: 'app-placeholder-detail-dialog',
    templateUrl: './placeholder-detail-dialog.component.html',
    styleUrls: ['./placeholder-detail-dialog.component.scss'],
})
export class PlaceholderDetailDialogComponent implements OnInit, OnDestroy, OnChanges {
    @Input()
    placeholderDialogModel: PlaceholderDialogModel;

    originalPlaceholder: PlaceholderViewModel;

    dataTypes: KeyValue<number, string>[] = [];

    selectedDataType: KeyValue<number, string>;

    PlaceholderDataTypeEnum = PlaceholderDataTypeEnum;

    validationResult: {
        field: string;
        message: string;
    };

    longestCaseValueTooltip = '';

    subscription = null;

    @Output()
    placeholderDialogModelChange = new EventEmitter<PlaceholderDialogModel>();

    constructor(
        private placeholderService: PlaceholderService,
        private placeholderDatatypePipe: PlaceholderDatatypePipe,
        private eventBus: NgEventBus,
        private projectTranslationService: ProjectTranslationService
    ) {}

    ngOnInit(): void {
        this.placeholderDialogModel = {
            placeholder: {
                id: 0,
                projectId: 0,
                translationsId: 0,
                textNodeId: 0,
                textNodeRowId: '',
                identifier: '',
                description: '',
                dataTypeModelId: null,
                longestCaseValue: '',
                extraLine: false,
            },
            visible: false,
        };

        this.selectedDataType = null;
        this.validationResult = {
            field: '',
            message: '',
        };

        //transforms enum into key-value-pair for primeng component
        const length = Object.keys(PlaceholderDataTypeEnum).length / 2;
        for (let i = 1; i <= length; i++) {
            this.dataTypes.push({
                key: i,
                value: this.placeholderDatatypePipe.transform(i),
            });
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnChanges() {
        this.selectedDataType = null;
        this.validationResult = {
            field: '',
            message: '',
        };

        if (this.placeholderDialogModel && this.placeholderDialogModel.placeholder.dataTypeModelId) {
            this.selectedDataType = {
                key: this.placeholderDialogModel.placeholder.dataTypeModelId,
                value: this.placeholderDatatypePipe.transform(this.placeholderDialogModel.placeholder.dataTypeModelId),
            };

            this.setLongestCaseValueTooltip();
        }

        this.createReference();
    }

    onChangeDataType() {
        this.setLongestCaseValueTooltip();
        this.validationResult = this.placeholderService.validate(
            this.selectedDataType?.key,
            this.placeholderDialogModel.placeholder.longestCaseValue
        );
    }

    //only close dialog when clicking outside the <p-dialog> on the <div class="screen-mask">
    onClickOutside(event: Event) {
        const element = event.target as HTMLElement;
        if (!element.classList?.contains('screen-mask')) {
            return;
        }

        this.onClose();
    }

    onClose() {
        this.validationResult = this.placeholderService.validate(
            this.selectedDataType?.key,
            this.placeholderDialogModel.placeholder.longestCaseValue
        );
        if (this.validationResult.field.length) {
            return;
        }

        this.placeholderDialogModel.placeholder.dataTypeModelId = this.selectedDataType.key;

        if (this.modelHasChanges()) {
            this.updatePlaceholder();
            this.eventBus.cast('translate:textareaValue', this.projectTranslationService.translationText);
            this.eventBus.cast('placeholder:longestValueUpdate', {
                identifier: this.placeholderDialogModel.placeholder.identifier,
                longestCaseValue: this.placeholderDialogModel.placeholder.longestCaseValue,
            });
        }

        this.placeholderDialogModel.visible = false;
    }

    updatePlaceholder() {
        this.subscription = this.placeholderService
            .updatePlaceholder(this.placeholderDialogModel.placeholder)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response) => {
                response && this.afterUpdatePlaceholderTextNodePlaceholderUpdate();
                //NOP
            });

        this.eventBus.cast('properties-window:update', true);
    }

    private createReference() {
        if (this.placeholderDialogModel?.placeholder) {
            this.originalPlaceholder = Object.assign({}, this.placeholderDialogModel.placeholder);
        }
    }

    private modelHasChanges() {
        const properties = Object.keys(this.placeholderDialogModel.placeholder);
        return properties.some((property) => {
            return this.originalPlaceholder[property] !== this.placeholderDialogModel.placeholder[property];
        });
    }

    private setLongestCaseValueTooltip() {
        switch (this.selectedDataType?.key) {
            case PlaceholderDataTypeEnum.Integer:
                this.longestCaseValueTooltip = 'an integer number';
                break;
            case PlaceholderDataTypeEnum.Double:
                this.longestCaseValueTooltip = 'a decimal number';
                break;
            case PlaceholderDataTypeEnum.FixedText:
                this.longestCaseValueTooltip = 'any text';
                break;
            case PlaceholderDataTypeEnum.DynamicText:
                this.longestCaseValueTooltip =
                    'an integer number greater than 0; acts as percentage of the length of the translation text';
                break;
        }
    }

    afterUpdatePlaceholderTextNodePlaceholderUpdate() {
        if (this.projectTranslationService?.selectedRow && this.placeholderDialogModel.placeholder) {
            const updatedPlaceholderIdentifier = this.placeholderDialogModel.placeholder.identifier;
            if (this.projectTranslationService.translationSourceType === 'structure') {
                const placeholders =
                    this.projectTranslationService.selectedRow['data']?.placeholders ??
                    this.projectTranslationService.selectedRow['parent']?.data?.placeholders;
                this.processPlaceHolders(placeholders, updatedPlaceholderIdentifier);
                if (this.projectTranslationService.selectedRow?.['parent']?.['data']?.['TextNodeId']) {
                    this.languageWiseLengthCalculation(this.projectTranslationService.selectedRow?.['parent']);
                }
                if (this.projectTranslationService.selectedRow?.['data']?.['TextNodeId']) {
                    this.languageWiseLengthCalculation(this.projectTranslationService.selectedRow);
                }
            } else {
                this.processPlaceHolders(
                    this.projectTranslationService.selectedRow['placeholders'],
                    updatedPlaceholderIdentifier
                );
            }
        }
    }
    updateTextNodePlaceholder(placeholder) {
        placeholder.longestCaseValue = this.placeholderDialogModel.placeholder.longestCaseValue;
        placeholder.description = this.placeholderDialogModel.placeholder.description;
        placeholder.datatypeId = this.placeholderDialogModel.placeholder.dataTypeModelId.toString();
        return placeholder;
    }
    private processPlaceHolders(placeholders, updatedPlaceholderIdentifier: string) {
        placeholders.forEach((placeholder) => {
            if (
                placeholder.identifier === updatedPlaceholderIdentifier &&
                placeholder.id === this.placeholderDialogModel.placeholder.id.toString()
            ) {
                this.updateTextNodePlaceholder(placeholder);
            }
        });
    }
    private languageWiseLengthCalculation(node: TreeNode) {
        this.projectTranslationService.selectedNodes = [];
        this.projectTranslationService.textNodeErrors = [];
        this.projectTranslationService.isMultipleLanguagesForLengthCalculation = true;

        this.projectTranslationService.selectedNodes.push(node);
        node?.children?.forEach((languageRow) => {
            this.projectTranslationService.textChanged = false;
            this.projectTranslationService.isSaveButtonDisabled = true;
            if (languageRow['data'].ID && languageRow['data'].translation !== '') {
                this.projectTranslationService.selectedNodes.push(languageRow);
            }
        });
        this.projectTranslationService.resetError();
        this.projectTranslationService.checkMaxCharacterMaxLength(this.projectTranslationService.selectedNodes[0]);
    }

    onShowValidation() {
        if (this.placeholderDialogModel.placeholder.longestCaseValue) {
            this.validationResult = this.placeholderService.validate(
                this.placeholderDialogModel.placeholder.dataTypeModelId,
                this.placeholderDialogModel.placeholder.longestCaseValue
            );
        }
    }
}
