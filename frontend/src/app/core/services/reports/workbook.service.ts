import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Alignment, Column, Workbook, Worksheet } from 'exceljs';
import * as saveAs from 'file-saver';
import * as JSZip from 'jszip';
import {
    ExcelSheet,
    Overview,
    Report,
    ReportFields,
    SampleTextCatalogReport,
    TextNodePropertiesReport,
    TranslationImportReportData,
} from 'src/app/components/dashboard/reports/project-creation-report/translation-import-report.model';
import { ReportService } from './report.service';
@Injectable({
    providedIn: 'root',
})
export class WorkbookService {
    private readonly excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    private readonly extension = '.xlsx';
    private readonly headerFontColor = 'ffffffff';
    private readonly headerBackgroundColor = 'ff304cd9';
    workBooks: ExcelSheet[] = [];
    downloadStatus = false;

    constructor(private datePipe: DatePipe, private reportService: ReportService) {}

    addHeader(worksheet: Worksheet, columns: Array<Partial<Column>>) {
        worksheet.columns = columns;
    }
    createReportZipFile(projectDetails: Overview) {
        if (this.workBooks.length > 0) {
            const zip = new JSZip();
            const folderName = this.getFolderName(projectDetails);
            const zipFilePromise = [];
            this.workBooks.forEach((workBook) => {
                zipFilePromise.push(
                    new Promise((resolve) => {
                        zip.file(workBook.fileName, workBook.blob);
                        resolve('File added in zip');
                    })
                );
            });
            Promise.all(zipFilePromise).then(() => {
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    const fileZipName = folderName + '.zip';
                    saveAs(content, fileZipName);
                });
                this.workBooks = [];
                this.reportService.isDisabledBtn = false;
                this.downloadStatus = false;
            });
        }
    }

    addWorksheet(workbook: Workbook, sheetName: string, nodeCount: number) {
        let name = this.convertKey(sheetName);
        name = nodeCount > 0 ? `${name} (${nodeCount})` : name;
        return workbook.addWorksheet(name);
    }

    addRows(worksheet: Worksheet, rows: ReportFields[] | TextNodePropertiesReport[] | SampleTextCatalogReport[]) {
        rows.forEach((row) => {
            worksheet.addRow(row);
        });
    }

    async createExcelAndDownload(
        languageWiseReport: Report,
        workbook: Workbook,
        importedData: TranslationImportReportData
    ) {
        const excelName = languageWiseReport.xmlLanguageCode + '-' + languageWiseReport.languageCode;
        await workbook.xlsx.writeBuffer().then((excelData) => {
            const blob = new Blob([excelData], {
                type: this.excelType,
            });
            this.workBooks.push({ blob: blob, fileName: excelName + this.extension });
            if (this.workBooks.length === importedData.reportData.length) {
                this.createReportZipFile(importedData.projectOverview);
            }
        });
    }
    private getValue(key, value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        } else if (key === 'versionId') {
            this.getVersion(value.toString());
        }
        return value.toString();
    }
    //TODO: Make it generic
    createReportFields(key: string, value: string | string[] | number) {
        return {
            field: key,
            Project: this.convertKey(key, value),
            Attributes: this.getValue(key, value),
        } as ReportFields;
    }

    convertKey(key: string, value?: string | string[] | number | unknown) {
        let convertedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        if (value && Array.isArray(value)) {
            convertedKey = `${convertedKey}  (${value.length})`;
        }
        return convertedKey;
    }

    getRows(data: Overview) {
        const reportFieldsList: ReportFields[] = [];
        for (const [key, value] of Object.entries(data)) {
            reportFieldsList.push(this.createReportFields(key, value as string | string[] | number));
        }
        return reportFieldsList;
    }

    // TODO: Please handle the styling for alignment
    getColumns(columns: Array<Partial<Column>>) {
        return columns.map((column) => ({
            header: column.header,
            width: column.width,
            key: column.header.toString(),
            alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
            } as Partial<Alignment>,
        }));
    }

    setStyleForExcel(sheet) {
        const fontColor = this.headerFontColor;
        const headerBGColor = this.headerBackgroundColor;
        sheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
            row.eachCell(function (cell) {
                cell.font = {
                    name: 'Arial',
                    family: 2,
                    bold: false,
                    size: rowNumber === 1 ? 12 : 10,
                };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'left',
                    wrapText: true,
                };

                if (rowNumber <= 1) {
                    cell.font = {
                        bold: rowNumber === 1 ? true : false,
                        color: { argb: fontColor },
                    };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: headerBGColor },
                    };
                }
                row.height = 25;
            });
        });
    }
    getFolderName(projectDetails: Overview) {
        return `translation-import-${projectDetails.title}-${this.getVersion(
            projectDetails.versionId.toString()
        )}-${this.datePipe.transform(new Date(), 'yyyy-MM-dd')}`;
    }

    private getVersion(version: string) {
        return version.split('.')[1] ?? version;
    }
}
