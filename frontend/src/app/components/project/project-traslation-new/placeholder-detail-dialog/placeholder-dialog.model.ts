import { PlaceholderDataTypeEnum } from './placeholder-data-type.enum';

export interface PlaceholderDialogModel {
    placeholder: PlaceholderViewModel;
    visible: boolean;
}

export interface PlaceholderViewModel {
    id: number;
    projectId: number;
    translationsId: number;
    textNodeId: number;
    textNodeRowId: string;
    identifier: string;
    description: string;
    dataTypeModelId: PlaceholderDataTypeEnum;
    longestCaseValue: string;
    extraLine: boolean;
}
