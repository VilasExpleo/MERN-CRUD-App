export interface TranslationChecksResponseModel {
    whiteSpaceAtBegin: string;
    whiteSpaceAtMiddle: string;
    whiteSpaceAtEnd: string;
    emptyRowAtBegin: string;
    emptyRowAtMiddle: string;
    emptyRowAtEnd: string;
    fillRate: {
        type: string;
        value: number;
    };
    emptyTranslation: string;
}
