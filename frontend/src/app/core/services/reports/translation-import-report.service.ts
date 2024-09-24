import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Column, Workbook, Worksheet } from 'exceljs';
import { filter, map, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { ResponseStatusEnum } from 'src/Enumerations';
import TranslationImportReportModel, {
    Overview,
    Report,
    SampleTextCatalogReport,
    SampleTextCatalogue,
    TextNodeProperties,
    TranslationImportReportData,
} from 'src/app/components/dashboard/reports/project-creation-report/translation-import-report.model';
import { environment } from 'src/environments/environment';
import { WorkbookService } from './workbook.service';
@Injectable({
    providedIn: 'root',
})
export class TranslationImportReportService {
    constructor(private httpClient: HttpClient, private workbookService: WorkbookService) {}

    baseUrl = `${environment.apiUrl}`;

    getTranslationImportReport(projectId: number): Observable<TranslationImportReportData> {
        this.workbookService.downloadStatus = true;
        // TODO: Request suppose to be GET or POST needs to check
        return this.httpClient
            .post<TranslationImportReportModel>(this.baseUrl + 'translation-import/get-import-report', { projectId })
            .pipe(
                filter((response) => this.isResponseOk(response)),
                map((response) => response['data']),
                tap((response) => this.downloadTranslationImportReport(response)),
                tap(() => (this.workbookService.downloadStatus = false))
            );
    }

    // TODO: Implement a message to user if no reports are available
    // case 1: Show just the project overview
    // case 2. Show a error message saying the reports are not available
    private downloadTranslationImportReport(importedData: TranslationImportReportData) {
        importedData.reportData.forEach((languageWiseReport: Report) => {
            const workbook = new Workbook();
            this.createOverview(importedData.projectOverview, workbook);

            const [firstAvailableTextNodeGroup] = this.getFirstAvailableTextNodeGroup(languageWiseReport) || [{}];
            const textNodeGroupSheetHeader = this.getHeader(firstAvailableTextNodeGroup);

            const [sampleTextCatalogueNode] = this.getSampleTextCatalogueNodeGroup(languageWiseReport) || [{}];
            const sampleTextCatalogueSheetHeader = this.getHeader(
                this.mapSampleTextProperties(sampleTextCatalogueNode)
            );

            Object.entries(languageWiseReport)
                .filter(([key]) => {
                    return key !== 'languageCode' && key !== 'xmlLanguageCode';
                })
                .forEach(([key]) => {
                    const nodeCount = languageWiseReport[key].length;
                    const worksheet = this.workbookService.addWorksheet(workbook, key, nodeCount);

                    // Ques: Shall we add an empty sheet with header or sheet suppose not to add with workbook
                    // Ques: if sample text catalogue is empty array then do we need to add empty sheet without any header
                    if (nodeCount > 0) {
                        key === 'sampleTextCatalogue'
                            ? this.writeSheetHeader(sampleTextCatalogueSheetHeader, worksheet)
                            : this.writeSheetHeader(textNodeGroupSheetHeader, worksheet);

                        const nodeProperties = languageWiseReport[key].map((propreties) => {
                            return key !== 'sampleTextCatalogue'
                                ? this.getTextNodeRows(propreties)
                                : this.getSampleTextCatalogNode(this.mapSampleTextProperties(propreties));
                        });

                        this.workbookService.addRows(worksheet, nodeProperties);
                    }
                });

            this.workbookService.createExcelAndDownload(languageWiseReport, workbook, importedData);
        });
    }

    private getFirstAvailableTextNodeGroup(report: Report) {
        return report[
            Object.keys(report)
                .filter((key) => key !== 'sampleTextCatalogue')
                .filter((key) => report[key] && Array.isArray(report[key]))
                .find((key) => report[key].length > 0)
        ];
    }

    private getSampleTextCatalogueNodeGroup(report: Report) {
        return report[
            Object.keys(report)
                .filter((key) => key === 'sampleTextCatalogue')
                .filter((key) => report[key] && Array.isArray(report[key]))
                .find((key) => report[key].length > 0)
        ];
    }

    private createOverview(overview: Overview, workbook: Workbook) {
        const worksheet = workbook.addWorksheet('Overview');
        const overviewHeaders: Array<Partial<Column>> = [];
        overviewHeaders.push(
            { header: 'Project', key: 'Project', width: 30 },
            { header: 'Attributes', key: 'Attributes', width: 50 }
        );
        // Prepare data for worksheet
        const columnsHeader = this.workbookService.getColumns(overviewHeaders);

        const rows = this.workbookService.getRows(overview);

        // write data to worksheet
        this.workbookService.addHeader(worksheet, columnsHeader);

        this.workbookService.addRows(worksheet, rows);

        this.workbookService.setStyleForExcel(worksheet);
    }

    private writeSheetHeader(nodeProperties: Array<Partial<Column>>, worksheet: Worksheet) {
        this.workbookService.addHeader(worksheet, nodeProperties);
        this.workbookService.setStyleForExcel(worksheet);
    }

    private getHeader(nodeProperties: TextNodeProperties | SampleTextCatalogue) {
        const nodePropsHeaders: Array<Partial<Column>> = [];
        for (const [key, value] of Object.entries(nodeProperties)) {
            if (value && typeof value === 'object') {
                for (const [subKey, subValue] of Object.entries(value)) {
                    const upperCaseSubKey = key + subKey.charAt(0).toUpperCase() + subKey.slice(1);
                    nodePropsHeaders.push({
                        header: this.workbookService.convertKey(key + ' ' + subKey, subValue),
                        width: 15,
                        key: upperCaseSubKey,
                    });
                }
            } else {
                nodePropsHeaders.push({
                    header: this.workbookService.convertKey(key, value),
                    key: key,
                    width: 15,
                });
            }
        }
        return nodePropsHeaders;
    }

    private isResponseOk(response) {
        return response['status']?.toLowerCase() === ResponseStatusEnum.OK.toLowerCase();
    }

    // TODO: confirm against STC
    private mapSampleTextProperties(sampleTextCatalog) {
        return {
            id: sampleTextCatalog.id,
            new: { ...sampleTextCatalog.newIdealAndShortFormValue },
            old: { ...sampleTextCatalog.oldIdealAndShortFormValue },
        };
    }

    private getTextNodeRows(textNodeProperties: TextNodeProperties) {
        return {
            editorSource: textNodeProperties.editor.source,
            editorStatus: textNodeProperties.editor.status,
            editorTranslation: textNodeProperties.editor.translation,
            id: textNodeProperties.id,
            listIndex: textNodeProperties.listIndex,
            locked: textNodeProperties.locked,
            name: textNodeProperties.name,
            newFont: textNodeProperties.new.font,
            newLengthCalculation: textNodeProperties.new.lengthCalculation,
            newLineBreak: textNodeProperties.new.lineBreak,
            newMaxCharacter: textNodeProperties.new.maxCharacter,
            newMaxLines: textNodeProperties.new.maxLines,
            newMaxWidth: textNodeProperties.new.maxWidth,
            oldFont: textNodeProperties.old.font,
            oldLengthCalculation: textNodeProperties.old.lengthCalculation,
            oldLineBreak: textNodeProperties.old.lineBreak,
            oldMaxCharacter: textNodeProperties.old.maxCharacter,
            oldMaxLines: textNodeProperties.old.maxLines,
            oldMaxWidth: textNodeProperties.old.maxWidth,
            translatorSource: textNodeProperties.translator.source,
            translatorStatus: textNodeProperties.translator.status,
            translatorTranslation: textNodeProperties.translator.translation,
            type: textNodeProperties.type,
            variant: textNodeProperties.variant,
        };
    }

    private getSampleTextCatalogNode(sampleTextCatalogue): SampleTextCatalogReport {
        return {
            id: sampleTextCatalogue.id,
            newIdealText: sampleTextCatalogue.new.idealText,
            newShortForm: sampleTextCatalogue.new.shortForm,
            oldIdealText: sampleTextCatalogue.old.idealText,
            oldShortForm: sampleTextCatalogue.old.shortForm,
        };
    }
}
