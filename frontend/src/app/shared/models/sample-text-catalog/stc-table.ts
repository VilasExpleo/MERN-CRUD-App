export interface STCTable {
    group_id: number;
    group_name: string;
    parent_group_id: number;
    sequence_order: number;
    brand_id: number;
    brand_name: string;
    language_code: string;
    stc_id: number;
    ideal_text: string;
    language_id: number;
    type: number;
    numerous: number;
    gender: number;
    short_form: [
        {
            id: number;
            stc_master_id: number;
            short_form: string;
            status: number;
        }
    ];
    description: [
        {
            id: number;
            stc_master_id: number;
            langauge_id: number;
            description: string;
        }
    ];
    path: string;
}
