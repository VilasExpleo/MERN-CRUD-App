export interface RichEditorOptions {
    spellchecking?: boolean;
    spaces?: boolean;
    rtl?: boolean;
    readonly?: boolean;
    findTerms?: boolean;
    findPlaceholders?: boolean;
}

export type LineBreakMode = 'Manual' | 'Word' | 'WordWithManual';
