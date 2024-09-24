export interface SpellCheckRequestModel {
    languageCode: string;
    userId: number;
    word: string[];
}

export interface suggestionsRequestModel {
    languageCode: string;
    userId: number;
    word: string;
}

export interface SpellCheckResponseInitModel {
    status: string | boolean;
    message: string;
}

export interface SpellCheckRequestInitModel {
    languageCode: string;
    userId: number;
    projectId: number;
}
