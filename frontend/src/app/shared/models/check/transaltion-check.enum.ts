export enum TranslationCheck {
    Labels = 'Character case mismatch',
    Placeholder = 'Placeholder',
    Length = 'Length',
    Consistency = 'Consistency',
    WhiteSpace = 'Redundant Space',
    EmptyRow = 'Excessive Row',
    Regex = 'Regex mismatch',
    Translation = 'Translation Check',
    Punctuation = 'Punctuation Check',
    Spell = 'Spellcheck',
    Grammar = 'Grammar Check',
}

export enum TranslationCheckType {
    Error = 'Error',
    Warning = 'Warning',
    None = 'None',
}

export enum SeverityLevel {
    Error = 'error',
    Warning = 'warn',
    Info = 'info',
    Success = 'success',
}
