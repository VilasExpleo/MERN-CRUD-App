export interface CalculateInputParams {
    lengthCalculatorId: number;
    fontName?: string;
    fontFileId?: number;
    linebreakMode?: string;
    alternativeFonts?: string[];
    dynamicFonts?: boolean;
    maxWidth?: number;
    translationId?: number;
}

export interface CalculationObject {
    width: number;
    text: string;
    unresolved?: number[];
    next?: number;
}
