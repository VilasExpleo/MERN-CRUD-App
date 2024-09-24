export interface CreateProjectRequestModel {
    existing_project_id: string;
    title: string;
    group_node_count: number;
    brand_id: number;
    project_type: string;
    editor_language: number;
    translation_role: number;
    placeholder: string;
    label_id: number;
    due_date: string;
    description: string;
    text_node_counts: number;
    creator: string;
    parent_project_id: number;
    user_id: number;
    status: string;
    is_metadata: 0;
    variant: string;
    project_manager_id: number;
    project_manager_email: string;
    language_mapping: string;
    language_inheritance: string;
    language_inheritance_tree: string;
    font_id: number;
    lengthCalculationIds: string;
    rawProjectId: string;
}
