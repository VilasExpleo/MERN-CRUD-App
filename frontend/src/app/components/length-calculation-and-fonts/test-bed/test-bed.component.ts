import { Component, OnDestroy, OnInit } from '@angular/core';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';
import { TestBedColumnModel, TestBedModel, TestBedRowsModel } from './test-bed.model';
import { Subject, debounceTime, pipe, takeUntil } from 'rxjs';
import {
    LcDropDownModel,
    WebsocketContentModel,
    WebsocketResponseModel,
} from 'src/app/shared/models/testbed/test-bed.model';
import { TestBedLcPayloadModel } from 'src/app/shared/models/testbed/test-bed-lc.model';
import { testBedColumnProperty } from './testbedEnum';
@Component({
    selector: 'app-test-bed',
    templateUrl: './test-bed.component.html',
})
export class TestBedComponent implements OnInit, OnDestroy {
    selectedRow: TestBedRowsModel;
    selectedLC: LcDropDownModel[] = [];
    model: TestBedModel;
    addedColumns: TestBedColumnModel[] = [];

    private textChanged$ = new Subject<string>();
    private destroyed$ = new Subject<boolean>();

    constructor(private readonly lengthCalculationService: LengthCalculationService) {}

    ngOnInit(): void {
        this.lengthCalculationService.getAvailableLC(`project-create/getlcdetails`);
        this.getTestBedConfiguration();
        this.updateLengthCalculationInTable();
        this.updateLengthCalculation();
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    getAvailableLC(): LcDropDownModel[] {
        return this.lengthCalculationService.availableLC.map((ele) => {
            return {
                lcName: `${ele?.lc_name}-V${ele?.lc_version}`,
                lcPath: ele?.lc_path,
            };
        });
    }

    onSelect(value: LcDropDownModel[]): void {
        const filteredOption = value.filter(
            (lc) => !this.model.columns.some((modelColumn) => modelColumn.header === lc.lcName)
        );

        if (filteredOption.length > 0) {
            this.addedColumns = this.getNewColumns(filteredOption);
            const texts = this.model.rows.map((text) => text?.sampleText);
            this.callWebsocketWithPayload(filteredOption, texts);
            this.model.columns.push(...this.addedColumns);
        } else {
            const removedIndex = this.model.columns.findIndex(
                (headerValue, index) =>
                    index !== 0 && !value.some((selectedValue) => selectedValue.lcName === headerValue.header)
            );
            this.model.columns.splice(removedIndex, 1);
        }
    }

    private callWebsocketWithPayload(value: LcDropDownModel[], texts: string[]): void {
        const payload = this.getPayload(value, texts);
        this.lengthCalculationService.sendLengthCalculationPayload(payload);
    }

    addRowWithTextBox(): void {
        this.model.rows.push({
            sampleText: '',
            id: this.model.rows.length,
            customText: true,
        });
    }

    calculateLengthForCustomText(value: string): void {
        this.textChanged$.next(value);
    }

    isTextHasError(rowData: TestBedRowsModel, col: TestBedColumnModel): boolean {
        return rowData[col?.field]?.includes('Unresolved');
    }

    isColumnNotSampleText(rowData: TestBedRowsModel, col: TestBedColumnModel): boolean {
        return !rowData?.customText || !this.isColumnSampleText(col);
    }

    isColumnSampleTextAndCustom(rowData: TestBedRowsModel, col: TestBedColumnModel): boolean {
        return rowData?.customText && this.isColumnSampleText(col);
    }

    delete(): void {
        this.model.rows = this.model.rows.filter((row) => row?.id !== this.selectedRow?.id);
    }

    onFocus(rowData: TestBedRowsModel) {
        this.selectedRow = rowData;
    }

    private getTestBedConfiguration(): void {
        this.lengthCalculationService.getTestBedConfiguration().subscribe((response: TestBedModel) => {
            this.model = response;
        });
    }

    private isColumnSampleText(col: TestBedColumnModel): boolean {
        return col?.field === testBedColumnProperty.sampleText;
    }

    private updateLengthCalculationInTable(): void {
        this.textChanged$.pipe(pipe(takeUntil(this.destroyed$)), debounceTime(400)).subscribe((value: string) => {
            this.addedColumns = this.getNewColumns(this.selectedLC);
            this.callWebsocketWithPayload(this.selectedLC, [value]);
        });
    }

    private updateLengthCalculation(): void {
        this.lengthCalculationService
            .getCalculatedMessage()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: WebsocketResponseModel) => {
                this.model?.rows?.forEach((rowData: TestBedRowsModel) => {
                    this.updateRow(this.addedColumns, response, rowData);
                });
            });
    }

    private updateRow(
        columns: TestBedColumnModel[],
        response: WebsocketResponseModel,
        rowData: TestBedRowsModel
    ): void {
        columns?.forEach((column: TestBedColumnModel) => {
            this.updateRowAndColumn(column, response, rowData);
        });
    }

    private updateRowAndColumn(
        column: TestBedColumnModel,
        response: WebsocketResponseModel,
        rowData: TestBedRowsModel
    ): void {
        response?.content?.forEach((content: WebsocketContentModel) => {
            if (this.isTextMatchWithResponse(column, content, rowData)) {
                if (this.isContentHasError(content)) {
                    rowData[content.lcName] = `${content.errorType + ' ' + this.getErrorContent(content)}`;
                } else {
                    rowData[content.lcName] = `${content.width}`;
                }
                rowData.error = content?.error;
            }
        });
    }

    private isTextMatchWithResponse(
        column: TestBedColumnModel,
        content: WebsocketContentModel,
        rowData: TestBedRowsModel
    ): boolean {
        return column?.field === content?.lcName && rowData?.sampleText === content?.text;
    }

    private getNewColumns(value: LcDropDownModel[]): TestBedColumnModel[] {
        return value.map((font) => {
            return {
                header: font?.lcName,
                field: font?.lcName,
            };
        });
    }

    private getPayload(value: LcDropDownModel[], texts: string[]): TestBedLcPayloadModel {
        return {
            texts,
            ...this.model.defaultFont,
            font: this.model.defaultFont.fontName,
            lcDetails: value,
            bold: false,
            italic: false,
        };
    }

    private isContentHasError(content: WebsocketContentModel): boolean {
        return content?.error?.length > 0 || content?.errorType?.includes('Unresolved');
    }

    private getErrorContent(content: WebsocketContentModel): string {
        return content?.error?.length > 0 ? content.error.join(',') : '';
    }
}
