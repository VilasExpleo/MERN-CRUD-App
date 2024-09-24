export interface IAssignData {
    language_code: string;
    language_id: number;
    translator_id: number;
    translator_email: string;
    proofreader_id: number;
    proofreader_email: string;
}

export interface TemplateData {
    language_code: string;
    translator: number;
    proofreader: number;
}

export interface ISaveAssignWorker {
    project_id: number;
    version_id: number;
    due_date: string;
    translation_request_id: number;
    translation_manager_id: number;
    translation_manager_email: string;
    assignment_data: IAssignData[];
    template_data;
}

export interface TreeNode {
    TextNodeId: number;
    array_item_index: number;
    context: string;
    db_text_node_id: number;
    fontFileId: string;
    fontName: string;
    language_id: number;
    lengthCalculatorId: string;
    linebreakMode: string;
    locked: string;
    mapped: string;
    max_width: string;
    metatext_info: string;
    parent_stc_id: string;
    row_index: number;
    sequence_no: number;
    state: string;
    stc_master_id: string;
    stc_shortform_id: string;
    text_node_type: string;
    translation: string;
    translation_lastchange: string;
    user: string;
    variant_id: number;
}

export interface DropDownModel {
    label: string;
    value: string;
}
