import { GPConfigurationErrorMessageEnum } from '../config-type.enum';

export interface ParserConfigModel {
    speechCommands: ConfigurationModel;
    speechPrompts: ConfigurationModel;
}
export interface ConfigurationModel {
    editor?: ParserConfigurationDetailsModel;
    translator?: ParserConfigurationDetailsModel;
}
export interface ParserConfigurationDetailsModel extends ParserConfigurationModel {
    type?: string;
    fileName?: string;
    file?: File;
    title?: string;
    standardType?: string;
    role?: string;
}

export interface ParserConfigurationModel {
    gpConfigId?: number;
    message?: string;
    messageSource?: GPConfigurationErrorMessageEnum;
}

export interface GrammarParserModel {
    parseConfigurationDetailsModel: ParserConfigurationDetailsModel[];
    formChange?: boolean;
}
