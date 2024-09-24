import { LineBreakMode } from '../../rich-text-editor.model';

export interface LeftSidebarModel {
    textLines: string[];
    lineBreakMode: LineBreakMode;
    isSourceText: boolean;
    maxWidth: number;
    linesWidth: number[];
    readOnly: boolean;
}
