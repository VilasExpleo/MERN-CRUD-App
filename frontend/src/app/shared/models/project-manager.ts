export interface IAssignData {
    language_code: string;
    language_id: number;
    translation_manager_id: number;
    translation_manager_email: string;
}

export interface ITemplateData {
    id?: number;
    layout_name: string;
    project_manager_id?: number;
    data;
    default_layout_selection: number;
}

export interface ISaveAssignTranslationManager {
    project_id: number;
    version_id: number;
    due_date: string;
    translation_request_id: number;
    project_manager_id: number;
    project_manager_email: string;
    reason: string;
    assignment: IAssignData[];
}

export interface ISaveTemplateData {
    layout_name: string;
    data;
    default_layout_selection: number;
    id: number;
}
