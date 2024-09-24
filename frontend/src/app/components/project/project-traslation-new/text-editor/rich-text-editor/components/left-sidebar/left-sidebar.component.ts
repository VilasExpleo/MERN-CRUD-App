import { Component, Input, OnChanges } from '@angular/core';
import { LineBreakEnum } from 'src/app/shared/enums/line-break.enum';
import { NgChanges } from 'src/app/shared/models/ng-on-changes/ng-on-changes';
import { LeftSidebarModel } from './left-sidebar.model';

@Component({
    selector: 'app-left-side-bar',
    templateUrl: './left-sidebar.component.html',
})
export class LeftSideBarComponent implements OnChanges {
    @Input()
    readOnly: boolean;

    @Input()
    leftSidebarModel: LeftSidebarModel;

    rows: string[];
    readonly = false;

    ngOnChanges(changes: NgChanges<LeftSideBarComponent>): void {
        // TODO 2: Verify the code execution only works with textLines
        if (changes.leftSidebarModel?.currentValue?.textLines) {
            this.rows = this.updateLeftSidebarState(changes);
            this.readOnly = changes.leftSidebarModel?.currentValue.readOnly;
        }
    }

    private updateLeftSidebarState(changes: NgChanges<LeftSideBarComponent>): string[] {
        const state = changes.leftSidebarModel?.currentValue;

        if (state.lineBreakMode === LineBreakEnum.MANUAL || state.isSourceText) {
            return this.manualOrSourceRowState(state.textLines);
        } else {
            return this.lineBreakRowState(state);
        }
    }

    private manualOrSourceRowState(textLines: string[]): string[] {
        return Array.from({ length: textLines.length }, (_, index) => index + 1 + ': ' + textLines[index].length);
    }

    private lineBreakRowState(state: LeftSidebarModel): string[] {
        if (this.isEmptyRow(state.textLines)) {
            return this.emptyRowState();
        } else if (this.isErrorState(state)) {
            return this.errorRowState(state.textLines);
        } else {
            return this.successRowState(state);
        }
    }

    private isEmptyRow(textLines: string[]): boolean {
        return textLines.length === 1 && textLines[0] === '';
    }

    private emptyRowState(): string[] {
        return ['1: %0'];
    }

    private isErrorState(state: LeftSidebarModel): boolean {
        return this.isMaxWidthUnavailable(state.maxWidth) || this.isLinesWidthUnavailable(state);
    }

    private isMaxWidthUnavailable(maxWidth: number | null): boolean {
        return maxWidth === null || maxWidth <= 0;
    }

    private isLinesWidthUnavailable(state: LeftSidebarModel | null): boolean {
        return state?.linesWidth === null || state?.linesWidth?.length !== state?.textLines?.length;
    }

    private errorRowState(textLines: string[]): string[] {
        return Array.from({ length: textLines.length }, (_, index) => index + 1 + ': %?');
    }

    private successRowState(state: LeftSidebarModel): string[] {
        return Array.from(
            { length: state.linesWidth.length },
            (_, index) => index + 1 + ': %' + Math.round((100 * state.linesWidth[index]) / state.maxWidth)
        );
    }
}
