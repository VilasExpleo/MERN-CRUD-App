export enum TranslationCheckType {
    Error,
    Warning,
    None,
}

export enum TranslationCheckDisplayEnum {
    speechCheck = 'Speech-Check',
    whiteSpaceAtBegin = 'Whitespace: begin',
    whiteSpaceAtMiddle = 'Whitespace: middle',
    whiteSpaceAtEnd = 'Whitespace: end',
    emptyRowAtBegin = 'Empty row(s): begin',
    emptyRowAtMiddle = 'Empty row(s): middle',
    emptyRowAtEnd = 'Empty row(s): end',
    fillRate = 'Fill rate check',
    emptyTranslation = 'Empty translation',
}
