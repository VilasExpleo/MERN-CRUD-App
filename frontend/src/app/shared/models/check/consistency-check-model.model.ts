export interface ConsistencyCheckModel {
    TranslationTexts: string[];
}

export interface ConsistencyCheckRequestModel {
    dbTextNodeId: string;
    languageCode: string;
    translationRequestId: number;
}
