export interface TranslationRole {
    id: string;
    translation_role: string;
}

export interface LengthCalculation {
    font_type: string;
    id: number;
    lc_author: string;
    lc_desc: string;
    lc_id: string;
    lc_name: string;
    lc_path: string;
    lc_version: string;
    lcfile_path: string;
}

export interface Font {
    font_author: string;
    font_desc: string;
    font_packagename: string;
    font_path: string;
    font_version: number;
    id: number;
}
