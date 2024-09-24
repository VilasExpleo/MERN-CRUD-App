export interface TranslationRequestModel {
    cols: Column[];
    description: string;
    selectedLanguages: TranslationLanguagesModel[];
    availableLanguages: ReferenceLanguageModel[];
}

export interface Column {
    header: string;
}

export interface ReferenceLanguageModel {
    language_code: string;
    language_id: number;
    is_done: boolean;
}

export interface TranslationLanguagesModel {
    language_code: string;
    language_id: number;
    word_count: number;
    isDone: boolean;
    additional_languages: ReferenceLanguageModel[];
}

export interface SelectedLanguage {
    language_code: string;
    language_id: number;
    word_count: number;
}
