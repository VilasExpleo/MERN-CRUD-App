export interface ProjectTranslate {
    sequence: number;
    property_name: string;
    external_reference: string;
    max_width: string;
    line_break_mode: string;
    source_text: string;
    font: string;
    mapped: string;
    name: string;
    data: string;
    languages: Array<any>;
    title: string;
}
export interface CalculateWordLineBreakPayload {
    font?: string;
    fontSize?: number;
    italic?: boolean;
    bold?: boolean;
    maxWidth?: number;
    lcFile?: string;
    fontDir?: string;
    text?: string | string[];
    fontType?: string;
    translateRole?: number;
}
export interface ReslovedFont {
    method: string;
    resolved: boolean;
    success: boolean;
}

//TODO To use camelCase.
export interface ProjectLengthCalculation {
    lcPath?: string;
    fontPath?: string;
    translation_role?: number;
}

export interface SelectedTextNodeChildLanguages {
    context: string;
}
