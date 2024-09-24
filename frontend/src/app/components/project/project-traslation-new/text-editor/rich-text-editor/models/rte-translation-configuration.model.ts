export interface RTETranslationConfigurationModel {
    space: ConfigurationModel;
    par: ConfigurationModel;
    newlineA: ConfigurationModel;
    newlineB: ConfigurationModel;
    placeholder: ConfigurationModel;
}

export interface ConfigurationModel {
    name: string;
    unnamedRegex: RegExp;
    namedRegex: RegExp;
    replacementString: string | null;
    colorBlue: boolean;
    advanceCursor: boolean;
}
