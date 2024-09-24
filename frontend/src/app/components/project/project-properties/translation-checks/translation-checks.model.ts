export interface TranslationChecksTemplateModel {
    name: string;
    configuration: TranslationChecksConfigurationModel;
    id?: number;
}

export interface TranslationChecksConfigurationModel {
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
