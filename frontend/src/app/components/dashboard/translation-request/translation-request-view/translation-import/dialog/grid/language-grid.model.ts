export interface TranslationLanguages {
    languageCode: string;
    languageId: number;
}

export interface LanguageGridModel {
    languages: LanguageModel[];
}

export interface LanguageModel {
    languageId: string;
    languageCode: string;
    checkListStatus?: string;
    totalTranslationTextNode?: number;
}
