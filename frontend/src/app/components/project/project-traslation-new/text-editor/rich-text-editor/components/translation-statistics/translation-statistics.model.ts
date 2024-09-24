import { LineBreakMode } from '../../rich-text-editor.model';

export class TranslationStatisticsModel {
    isVisible: boolean;
    isSourceText: boolean;
    nbRows: number;
    nbCharacters: number;
    nbWords: number;
    maxWidth: number;
    maxRows: number;
    maxCharacters: number;
    lineBreakMode: LineBreakMode;
    unresolvedSymbols: string[];
    linesWidth: number[];
}
