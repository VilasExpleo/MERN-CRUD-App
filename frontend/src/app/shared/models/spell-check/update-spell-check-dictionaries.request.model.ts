export interface SpellCheckDictionariesRequestModel {
    dictionaries: DictionaryModel[];
}

export interface DictionaryModel {
    languageId: number;
}
