export interface ProjectManagerTR {
    ID: number;
    project_id: number;
    version: number;
    version_id: number;
    project_manager_id: number;
    proofread: string;
    description: string;
    editor_translate_status: number;
    editor_due_date: string;
    language_prop: Array<any>;
    project_title: string;
    progress_main?: number;
    document?: string; // TODO: as document variable showing if the document is attached or not so should be boolean
    reason?: string;
    translation_request_id?: number;
    tmdata?: any;
}
