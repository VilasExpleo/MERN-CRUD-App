export interface TranslationManager {
    translation_request_id: number;
    project_id: number;
    version_id: number;
    version_id_show: string;
    pm_due_data: Date;
    proofread: boolean;
    document: string;
    status: number;
    project_title: string;
    brand: string;
    language_prop: LanguageProp[];
    projectId?: number;
    versionId?: number;
    description: string;
    documentCount: number;
}
export interface LanguageProp {
    language_id: number;
    language_code: string;
    status: number;
    translation_request: string;
    translator: string;
    proofreader: string;
    wordcount: number;
    return_date: string;
}

export interface LanguageCount {
    total_count: number;
    completed_count: number;
}

export interface Translator {
    project_id: number;
    version_id: number;
    due_date: Date;
    project_title: string;
    brand: string;
    translation_request_id: number;
    source_language: string;
    status: number;
    tickets: number;
    progress: number;
}

export interface TranslatorGetData {
    ID: number;
    project_id: number;
    version_id: number;
    version_id_show: string;
    translation_request_id: number;
    due_date: Date;
    language_id: number;
    language_code: string;
    status: number;
    total_word_count: number;
    title: string;
    brand_id: number;
    editor_language: number;
    brand_name: string;
    editor_language_code: string;
    document: string;
    progress: number;
    tickets: string;
    remainingTime: number;
    totalTextNodeCount: number;
    proofread: boolean;
    proofreadProgress: number;
    description?: string;
}

export interface TableData {
    sequence_no: number;
    property_name: string;
    max_width: string;
    max_lines: string;
    max_length: string;
    line_break_mode: string;
    source: string;
    source_status: string;
    font: string;
    text_node_id: number;
    array_item_index: string;
    variant_id: string;
    review_status: number;
    proofread_status: number;
    proofread_comment: string;
    review_comment: string;
}
