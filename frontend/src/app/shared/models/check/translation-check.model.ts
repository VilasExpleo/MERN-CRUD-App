import { TranslationCheck } from './transaltion-check.enum';
export interface TranslationCheckModel {
    logLevel: string;
    message: string;
    type: TranslationCheck;
}

export interface TranslationCheckConfigModel {
    whiteSpaceAtBegin: string;
    whiteSpaceAtMiddle: string;
    whiteSpaceAtEnd: string;
    emptyRowAtBegin: string;
    emptyRowAtMiddle: string;
    emptyRowAtEnd: string;
    fillRate: FilRateModel;
    emptyTranslation: string;
}

export enum TranslationCheckMessage {
    whiteSpaceAtBegin = `Check the blank space at the beginning of the translation.`,
    whiteSpaceAtMiddle = `Check the blank space at middle of the translation.`,
    whiteSpaceAtEnd = `Check the blank space at the end of the translation.`,
    emptyRowAtBegin = `Check the empty row at the beginning of the translation.`,
    emptyRowAtMiddle = `Check the empty row at the middle of the translation.`,
    emptyTranslation = `Check the empty translation`,
    emptyRowAtEnd = `Check the empty row at the end of the translation.`,
    fillRate = `Fill rate exceeds in the translation.`,
    consistency = `The translated text isn't consistent to the translation memory. Check for consistent use of terminology.`,
}

export interface FilRateModel {
    type: string;
    value: number;
}

export interface FillRateCondition {
    warning: boolean;
    error: boolean;
}
