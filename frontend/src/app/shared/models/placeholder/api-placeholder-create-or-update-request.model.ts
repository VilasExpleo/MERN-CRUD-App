export interface ApiPlaceholderCreateOrUpdateRequestModel {
    id: number;
    projectId: number;
    datatypeId: number;
    textNodeId: number;
    textNodeRowId: string;
    translationsId: number;
    identifier: string;
    description: string;
    longestCaseValue: string;
    extraLine: boolean;
}
