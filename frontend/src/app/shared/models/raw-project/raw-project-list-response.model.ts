export interface RawProjectListResponseModel {
    status: string;
    message?: string;
    data?: RawProjectListEntryResponseModel[];
}

export interface RawProjectListEntryResponseModel {
    id: number;
    projectXmlId: string;
    name: string;
    version: number;
    dataCreatorId: number;
    languageCount: number;
    editor: RawProjectListEntryEditorResponseModel;
}

export interface RawProjectListEntryEditorResponseModel {
    id: number;
    name: string;
}
