import { RangeStatic } from 'quill';

export interface RTETranslationConstructionModel {
    insertedSubstrings: SubStringRangeModel[];
    blueRanges: RangeModel[];
    placeholderRanges: RangeModel[];
    toHighlight: RangeModel[];
    originalText: string;
    modifiedText: string;
    userSelection: RangeStatic;
}

export interface RangeModel {
    index: number;
    length: number;
}

export interface SubStringRangeModel extends RangeModel {
    substring: string;
}
