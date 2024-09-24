export interface GrammarParserSocketResponseModel {
    standardCheck: GrammarChecksModel;
    translationChecks: GrammarChecksModel;
}

interface GrammarChecksModel {
    errors: string[];
    warnings: string[];
}
