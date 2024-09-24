/* eslint-disable @typescript-eslint/ban-types */
export interface STCHistory {
    action?: string;
    action_taken_by?: number;
    attribute_id?: string;
    attribute_name?: string;
    id?: string;
    language_code?: string;
    language_id?: number;
    new_value?: string;
    old_value?: string;
    stc_id?: string;
    updated_on?: string;
    user_name?: string;
}
export interface ProjectHistory {
    Id?: number;
    changed_by: number;
    changed_on?: number;
    created_by?: number;
    editor_id?: number;
    existing_project_id?: string;
    mass_operation_type?: string;
    message?: string;
    project_id?: number;
    title?: string;
    updated_on?: string;
    user_name?: string;
    version_id?: number;
    version_name?: string;
}
export interface TransaltionHistory {
    Id?: number;
    action?: string;
    action_taken_by?: number;
    array_item_index?: number;
    attribute_name?: string;
    language_code?: string;
    new_value?: string;
    old_value?: string;
    project_id?: number;
    text_node_id?: number;
    updated_on?: string;
    user_name?: string;
    variant_id?: number;
    version_id?: number;
}
export interface IprimeNgFilter {
    filter?: unknown[];
    sort?: Object;
}
export interface IstcHistoryPayload extends IprimeNgFilter {
    language_code?: string;
    stc_id?: number;
    text?: string;
}
