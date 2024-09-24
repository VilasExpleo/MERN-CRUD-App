import { Injectable } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { TreeNode } from 'primeng/api';
import { Observable } from 'rxjs';
import { PlaceholderDataTypeEnum } from 'src/app/components/project/project-traslation-new/placeholder-detail-dialog/placeholder-data-type.enum';
import { PlaceholderViewModel } from '../../../../components/project/project-traslation-new/placeholder-detail-dialog/placeholder-dialog.model';
import { PlaceholderTransformer } from '../../../../components/project/project-traslation-new/placeholder-detail-dialog/placeholder.transformer';
import { ApiPlaceholderCreateOrUpdateRequestModel } from '../../../../shared/models/placeholder/api-placeholder-create-or-update-request.model';
import { ApiPlaceholderCreateOrUpdateResponseModel } from '../../../../shared/models/placeholder/api-placeholder-create-or-update-response.model';
import { ApiService } from '../../api.service';

@Injectable({
    providedIn: 'root',
})
export class PlaceholderService {
    placeholderURL: string;
    placeholderDataTypeEnum = PlaceholderDataTypeEnum;
    placeholderDynamicValues = [];
    selectedTreeNode: TreeNode;
    parentTextNode: TreeNode;
    constructor(private apiService: ApiService, private eventBus: NgEventBus) {
        this.placeholderURL = 'placeholder/';
        this.eventBus
            .on('translateData:translateObj')

            .subscribe({
                next: (res: MetaData) => {
                    this.selectedTreeNode = res?.data?.treeNode;
                },
            });
    }

    updatePlaceholder(viewData: PlaceholderViewModel): Observable<ApiPlaceholderCreateOrUpdateResponseModel> {
        const requestParams: ApiPlaceholderCreateOrUpdateRequestModel = PlaceholderTransformer.mapToApiModel(viewData);
        return this.apiService.postTypeRequestTyped<ApiPlaceholderCreateOrUpdateResponseModel>(
            this.placeholderURL + 'placeholder',
            requestParams
        );
    }

    generateRegularExpressionForSelectedTextNode(selectedNode: TreeNode): RegExp {
        const placeholders = this.placeholders(selectedNode);

        if (placeholders === undefined || placeholders.length === 0) {
            return new RegExp('(?!)', 'g'); // Matches nothing at all
        } else {
            return new RegExp(
                placeholders
                    .map(
                        (el) =>
                            '(?<=^|\\s|•)(' +
                            el.identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                            ')(?=$|\\s|•|¶\n|\n)'
                    )
                    .join('|'),
                'g'
            );
        }
    }

    generateNamedRegularExpressionForSelectedTextNode(selectedNode: TreeNode, name: string): RegExp {
        const placeholders = this.placeholders(selectedNode);

        if (placeholders === undefined || placeholders.length === 0) {
            return new RegExp('(?!)', 'g'); // Matches nothing at all
        } else {
            return new RegExp(
                '(?<' +
                    name +
                    '>' +
                    placeholders
                        .map(
                            (el) =>
                                '(?<=^|\\s|•)(' +
                                el.identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                                ')(?=$|\\s|•|¶\n|\n)'
                        )
                        .join('|') +
                    ')',
                'g'
            );
        }
    }

    getPlaceholderIdentifiers(selectedNode: TreeNode) {
        return this.placeholders(selectedNode)?.map((placeholder) => ({
            identifier: placeholder.identifier,
            longestCaseValue: placeholder.longestCaseValue,
        }));
    }

    private placeholders(selectedNode: TreeNode) {
        return (
            selectedNode?.data?.placeholders ||
            selectedNode?.parent?.data?.placeholders ||
            selectedNode?.['placeholders']
        );
    }

    generateRegexForPlaceholderIdentifier(identifier: string) {
        return identifier.split('').reduce((prevChar, currentChar) => {
            if (currentChar.match(/[a-zA-Z]/)) return prevChar + '\\d+';
            return prevChar + '\\' + currentChar;
        }, '');
    }

    getPlaceholderRegex(data) {
        if (!data?.placeholder?.length) {
            return undefined;
        }
        const placeholdersRegex = JSON.parse(data.placeholder)
            .filter((placeholder) => placeholder.isActive)
            .map((activePlaceholder) => this.generateRegexForPlaceholderIdentifier(activePlaceholder.symbol));
        return new RegExp(placeholdersRegex.join('|'), 'g');
    }

    getTranslationTextWithPlaceholderWorstCaseValue(
        rowData: any,
        parentNode?: any,
        text?: string,
        source?: string
    ): any {
        if (text === undefined || text === null || text === '') {
            return '';
        }
        let updatedTranslationText = { translationText: text, dynamicValue: 0 };

        this.parentTextNode = rowData?.TextNodeId ? rowData : parentNode;
        const placeholders = this.getPlaceholders(rowData, this.parentTextNode);
        placeholders?.forEach((placeholder) => {
            if (typeof text !== 'number' && text.includes(placeholder.identifier)) {
                let worstCaseValue = '';

                if ((source !== 'LC' && placeholder?.longestCaseValue === '') || !placeholder?.longestCaseValue) {
                    worstCaseValue = "<span class='worstCaseValue'>" + placeholder.identifier + '</span>';
                } else if (+placeholder.datatypeId === PlaceholderDataTypeEnum.DynamicText) {
                    worstCaseValue = "<span class='worstCaseValue'>" + placeholder.identifier + '</span>';
                } else {
                    worstCaseValue = !placeholder?.longestCaseValue
                        ? ''
                        : "<span class='worstCaseValue'>" + placeholder?.longestCaseValue + '</span>';
                }
                if (+placeholder.datatypeId === PlaceholderDataTypeEnum.DynamicText) {
                    if (
                        !this.placeholderDynamicValues.map((item) => item.identifier).includes(placeholder.identifier)
                    ) {
                        this.placeholderDynamicValues.push({
                            identifier: placeholder.identifier,
                            value: +placeholder?.longestCaseValue,
                        });
                    }
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        worstCaseValue,
                        placeholder?.longestCaseValue
                    );
                } else {
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        worstCaseValue,
                        0
                    );
                }
            }
        });

        return updatedTranslationText;
    }

    getPlaceholders(rowData: any, currentTextNode: TreeNode) {
        if (rowData && Object.prototype.hasOwnProperty.call(rowData, 'ID')) {
            return currentTextNode?.['placeholders'];
        } else {
            return rowData?.['data']?.placeholders ?? rowData?.placeholders ?? currentTextNode?.['placeholders'];
        }
    }

    private getUpdatedTranslationText(
        updatedTranslationText: any,
        placeholder: any,
        text: string,
        dynamicValue: number
    ) {
        return {
            translationText: updatedTranslationText.translationText.replaceAll(placeholder?.identifier, text),
            dynamicValue: dynamicValue,
        };
    }

    getTranslationTextWithPlaceholderWorstCaseValueForLC(rowData: any, text?: string, parentNode?: any): any {
        if (text === undefined || text === null || text === '') {
            return '';
        }
        let updatedTranslationText = { translationText: text, dynamicValue: 0 };
        this.parentTextNode = rowData?.TextNodeId ? rowData : parentNode;
        const placeholders = this.getPlaceholders(rowData, this.parentTextNode);
        placeholders?.forEach((placeholder) => {
            if (typeof text !== 'number' && text.includes(placeholder.identifier)) {
                if (+placeholder.datatypeId === PlaceholderDataTypeEnum.DynamicText) {
                    if (
                        !this.placeholderDynamicValues.map((item) => item.identifier).includes(placeholder.identifier)
                    ) {
                        this.placeholderDynamicValues.push({
                            identifier: placeholder.identifier,
                            value: +placeholder?.longestCaseValue,
                        });
                    } else {
                        const placeholderDynamicValue = this.placeholderDynamicValues.find(
                            (item) => item.identifier === placeholder.identifier
                        );
                        if (placeholderDynamicValue) placeholderDynamicValue.value = +placeholder.longestCaseValue;
                    }
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        '',
                        placeholder?.longestCaseValue
                    );
                } else {
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        !placeholder?.longestCaseValue ? '' : placeholder?.longestCaseValue,
                        0
                    );
                }
            } else {
                this.placeholderDynamicValues = [];
            }
        });

        return updatedTranslationText;
    }

    getTranslationTextWithPlaceholderWorstCaseValueTitle(
        rowData: any,
        parentNode?: any,
        text?: string,
        source?: string
    ): any {
        if (text === undefined || text === null || text === '') {
            return '';
        }
        let updatedTranslationText = { translationText: text, dynamicValue: 0 };

        this.parentTextNode = rowData?.TextNodeId ? rowData : parentNode;
        const placeholders = this.getPlaceholders(rowData, this.parentTextNode);
        placeholders?.forEach((placeholder) => {
            if (typeof text !== 'number' && text.includes(placeholder.identifier)) {
                let worstCaseValue = '';

                if ((source !== 'LC' && placeholder?.longestCaseValue === '') || !placeholder?.longestCaseValue) {
                    worstCaseValue = placeholder.identifier;
                } else if (+placeholder.datatypeId === PlaceholderDataTypeEnum.DynamicText) {
                    worstCaseValue = placeholder.identifier;
                } else {
                    worstCaseValue = !placeholder?.longestCaseValue ? '' : placeholder?.longestCaseValue;
                }
                if (+placeholder.datatypeId === PlaceholderDataTypeEnum.DynamicText) {
                    if (
                        !this.placeholderDynamicValues.map((item) => item.identifier).includes(placeholder.identifier)
                    ) {
                        this.placeholderDynamicValues.push({
                            identifier: placeholder.identifier,
                            value: +placeholder?.longestCaseValue,
                        });
                    }
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        worstCaseValue,
                        placeholder?.longestCaseValue
                    );
                } else {
                    updatedTranslationText = this.getUpdatedTranslationText(
                        updatedTranslationText,
                        placeholder,
                        worstCaseValue,
                        0
                    );
                }
            }
        });

        return updatedTranslationText;
    }

    //Start: Generalizing placeholder validation code

    validate(selectedDataTypeKey: number, longestCaseValue: string) {
        let validationResult = {
            field: '',
            message: '',
        };

        switch (selectedDataTypeKey) {
            case PlaceholderDataTypeEnum.Double: {
                validationResult = this.validatePlaceholderWorstCaseValue(this.isFloat, longestCaseValue);
                break;
            }

            case PlaceholderDataTypeEnum.Integer: {
                validationResult = this.validatePlaceholderWorstCaseValue(this.isInteger, longestCaseValue);
                break;
            }

            case PlaceholderDataTypeEnum.FixedText: {
                break;
            }

            case PlaceholderDataTypeEnum.DynamicText: {
                validationResult = this.validatePlaceholderWorstCaseValue(
                    this.isIntegerZeroOrGreater,
                    longestCaseValue
                );
                break;
            }

            default: {
                validationResult = this.getErrorDataTypeIsMandatory();
            }
        }
        return validationResult;
    }

    private validatePlaceholderWorstCaseValue(checker, longestCaseValue) {
        if (longestCaseValue.length) {
            if (!checker(longestCaseValue)) {
                return this.getErrorDataTypeAndLongestCaseValueMismatch();
            }
        }
        return {
            field: '',
            message: '',
        };
    }

    private isInteger(value) {
        const reg = /^[1-9]\d*$/;
        return reg.test(value);
    }

    private isIntegerZeroOrGreater(value) {
        const reg = /^\d+$/;
        return reg.test(value);
    }

    private isFloat(value: string) {
        const number = Number.parseFloat(value);
        let valid = !isNaN(number);
        if (valid) {
            if (number.toString().length != value.length) {
                valid = false;
            }
        }
        return valid;
    }

    private getErrorDataTypeIsMandatory() {
        return {
            field: 'dataType',
            message: 'Selecting a type is mandatory!',
        };
    }

    private getErrorDataTypeAndLongestCaseValueMismatch() {
        return {
            field: 'longestCaseValue',
            message: 'The longest case value does not match the selected data type!',
        };
    }
    //End: Generalizing placeholder validation code
}
