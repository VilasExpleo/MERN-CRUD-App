export interface TranslationTreeNodeRequestModel extends TranslationBaseRequestModel {
    node_id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TranslationChildNodeRequestModel extends TranslationBaseRequestModel {}

export interface TranslationBaseRequestModel {
    project_id: number;
    version_id: number;
    lang?: string;
    language_code?: string;
    translation_request_id?: number;
    role: string;
    start_row?: number;
    end_row?: number;
    reviewType?: string;
    viewName?: string;
    variantName?: string;
}
