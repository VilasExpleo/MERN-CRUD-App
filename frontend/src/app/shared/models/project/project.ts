export interface ProjectModel {
    project_id?: number;
    existing_project_id?: string;
    user_id?: number;
    group_node_count?: number;
    brand_id?: number;
    project_type?: number;
    editor_language?: number;
    translation_role?: number;
    label_id?: number;
    title?: string;
    status?: string;
    due_date?: string;
    date_created?: string;
    description?: string;
    id?: string;
    version_no; //TODO In editor Dashboard
    editor_language_code?: string;
    date_updated?: string;
    isRawProject?: boolean;
    isUpdated?: boolean;
}
