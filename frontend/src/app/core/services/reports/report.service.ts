import { WarningReportModel } from './../../../shared/models/reports/warning-report-response.model';
/* eslint-disable sonarjs/elseif-without-else */ /* eslint-disable sonarjs/no-all-duplicated-branches */

import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { Observable, of } from 'rxjs';
import { LogLevel } from 'src/Enumerations';
import { ApiService } from '../api.service';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root',
})
export class ReportService {
    downloadReportName;
    reportData;
    reportProjectuuId;
    reportDataJson1;
    successDataJson = [];
    completeReport = [];
    warningDataJson = [];
    mappingReportDataJson;
    mappingAssistantResponse;
    changeTextNodeWarningData;
    changeTextNodeSuccessData;
    changeTextNodeErrorData;
    loading = false;
    projectUpdateReport;
    newTextnodelength;
    showHideButtons = true;
    hideButtons = false;
    isDisabledBtn = true;
    warningReport = [];

    constructor(private apiService: ApiService) {}

    exportToexcel(projectId): Observable<any> {
        return this.apiService.postTypeRequest('mass-report', projectId);
    }
    exportTorecalculation(projectId): Observable<any> {
        return this.apiService.postTypeRequest('mass-report/recalculation-report', projectId);
    }
    exportToMapping(projectId): Observable<any> {
        return this.apiService.postTypeRequest('mass-report/mapping-assistent-report', projectId);
    }
    private getType(index, element) {
        if (index === 0) {
            if (element.node_type === null) {
                return 'Standard Text';
            } else {
                return element.node_type;
            }
        }
        return '';
    }
    getMappingOverviewData(mappingAssistentreportData): Observable<any> {
        const versionNo = mappingAssistentreportData.version_no;
        const string = versionNo.toString();
        const ver_no = string.substring(string.indexOf('.') + 1, string.length);
        const textCount =
            mappingAssistentreportData.complete_report[0].mapped.length +
            mappingAssistentreportData.complete_report[0].unmapped.length +
            mappingAssistentreportData.complete_report[0].ambiguous.length;
        let creationDate = mappingAssistentreportData.date_created;
        creationDate = creationDate.substring(0, 10);

        const mappingReportDataJson = [
            {
                Attributes: 'Creation',
                Project: creationDate,
            },
            {
                Attributes: 'Creator',
                Project: mappingAssistentreportData.creator,
            },
            {
                Attributes: 'Project Name',
                Project: mappingAssistentreportData.project_name,
            },
            {
                Attributes: 'ID',
                Project: mappingAssistentreportData.existing_project_id,
            },
            {
                Attributes: 'Version (old)',
                Project: mappingAssistentreportData.old_version_no,
            },
            {
                Attributes: 'Version (new)',
                Project: '' + ver_no,
            },
            {
                Attributes: 'Texts',
                Project: '' + textCount,
            },
            {
                Attributes: 'Mapped',
                Project: '' + mappingAssistentreportData.complete_report[0].mapped.length,
            },
            {
                Attributes: 'Not Mapped',
                Project: '' + mappingAssistentreportData.complete_report[0].unmapped.length,
            },
            {
                Attributes: 'Ambiguous',
                Project: '' + mappingAssistentreportData.complete_report[0].ambiguous.length,
            },
        ];
        const createMappedReportArr = [];
        const createUnmappedReportArr = [];
        const createAmbiguousReportArr = [];

        mappingAssistentreportData.complete_report[0].mapped.forEach((element) => {
            element.mapped_data.forEach((mappedDataelement, indexMD) => {
                const afterMappedData: any = {
                    Id: indexMD === 0 ? element.node_id : '',
                    'Property Name': indexMD === 0 ? element.name.trim() : '',
                    Variant: indexMD === 0 ? element.variant_name : '',
                    'List-Index': indexMD === 0 ? element.array_item_index : '',
                    Type: this.getType(indexMD, element),
                    'Source Text': indexMD === 0 ? element.source_text : '',
                    'Labels [old]': '',
                    'Labels [new]': mappedDataelement.label,
                    Score: mappedDataelement.rating,
                    'Mapped STC Id': mappedDataelement.stc_id,
                    'Mapped form (ideal text or short form x)': mappedDataelement.form,
                    'Mapping Ideal Text': mappedDataelement.ideal_text,
                    'Editor Language [old]': mappedDataelement.text_old,
                    'Editor Language [new after mapping]': mappedDataelement.text_new,
                    'Editor Status [old]': mappedDataelement.status_old,
                    'Editor Status [new]': mappedDataelement.status_new,
                };
                createMappedReportArr.push(afterMappedData);
            });
        });

        mappingAssistentreportData.complete_report[0].unmapped.forEach((elementUM) => {
            const unmapdata: any = {
                Id: elementUM.node_id,
                'Property Name': elementUM.name.trim(),
                Variant: elementUM.variant_name,
                'List-Index': elementUM.array_item_index,
                Type: elementUM.node_type,
                Labels: elementUM.translation_label,
                'Source Text': elementUM.source_text,
                Score: '',
                'Editor Language': elementUM.language_code,
                'Editor Status': elementUM.status,
                Reason: elementUM.reason,
            };
            createUnmappedReportArr.push(unmapdata);
        });

        mappingAssistentreportData.complete_report[0].ambiguous.forEach((elementambiguous) => {
            elementambiguous.ambiguous_data.forEach((ambiguousDataelement, indexAMD) => {
                const afterambiguousData: any = {
                    Id: indexAMD === 0 ? elementambiguous.node_id : '',
                    'Property Name': indexAMD === 0 ? elementambiguous.name.trim() : '',
                    Variant: indexAMD === 0 ? elementambiguous.variant_name : '',
                    'List-Index': indexAMD === 0 ? elementambiguous.array_item_index : '',
                    Type: this.getType(indexAMD, elementambiguous),
                    'Labels [old]': '',
                    'Labels [new]': indexAMD === 0 ? elementambiguous.translation_label : '',
                    'Source Text': elementambiguous.source_text,
                    Score: ambiguousDataelement.rating,
                    'STC Id': ambiguousDataelement.stc_id,
                    'Proposed Translation': ambiguousDataelement.ideal_text,
                    'Proposed form': '',
                    'Mapping Ideal Text': ambiguousDataelement.ideal_text,
                    'Editor Language': indexAMD === 0 ? elementambiguous.language_code : '',
                    'Editor status': indexAMD === 0 ? elementambiguous.status : '',
                };
                createAmbiguousReportArr.push(afterambiguousData);
            });
        });

        const reportdata: any = {
            mappingReportDataJson: mappingReportDataJson,
            createMappedReportArr: createMappedReportArr,
            createUnmappedReportArr: createUnmappedReportArr,
            createAmbiguousReportArr: createAmbiguousReportArr,
        };
        return of(reportdata);
    }

    downloadReport(pid) {
        const project_Id = {
            project_id: pid,
        };
        this.exportToexcel(project_Id).subscribe((res) => {
            this.reportData = res;
            let newDate = this.reportData?.data?.data_creation_date;
            newDate = newDate.substring(0, 10);
            if (res.data.mass_operation_type == 'project-creation') {
                this.downloadReportName = res.data.project_name;
                this.reportProjectuuId = res.data.existing_project_id;
                const languages = this.reportData.data.languages;
                const langs = languages?.join(', ');
                const fontsArr = this.reportData.data.fonts;
                const fonts = fontsArr?.join(', ');
                const variantsArr = this.reportData.data.variants;
                const variants = variantsArr?.join(', ');
                const LcData = this.reportData.data.Lc;
                const Lc = LcData?.join(', ');
                const versionNo = this.reportData.data.version_no;
                const string = versionNo?.toString();
                const Ver_No = string.substring(string.indexOf('.') + 1, string.length);
                this.reportDataJson1 = [
                    {
                        Attributes: 'Project Name',
                        Project: this.reportData.data.project_name,
                    },
                    {
                        Attributes: 'Project Id',
                        Project: '' + this.reportProjectuuId,
                    },
                    {
                        Attributes: 'Version No',
                        Project: '' + Ver_No,
                    },
                    {
                        Attributes: 'Brand',
                        Project: this.reportData.data.brand,
                    },
                    {
                        Attributes: 'Type',
                        Project: this.reportData.data.type,
                    },
                    {
                        Attributes: 'Description',
                        Project: this.reportData.data.description,
                    },
                    {
                        Attributes: 'Data Creation Date',
                        Project: newDate,
                    },
                    {
                        Attributes: 'Creator',
                        Project: this.reportData.data.creator,
                    },
                    {
                        Attributes: 'Languages (' + languages.length + ')',
                        Project: langs,
                    },
                    {
                        Attributes: 'Variants (' + variantsArr.length + ')',
                        Project: variants,
                    },
                    {
                        Attributes: 'Length Calculations (' + LcData.length + ')',
                        Project: Lc,
                    },
                    {
                        Attributes: 'Fonts (' + fontsArr.length + ')',
                        Project: fonts,
                    },
                    {
                        Attributes: 'Group Node Count',
                        Project: '' + this.reportData.data.group_node_count,
                    },
                    {
                        Attributes: 'Text Node Count',
                        Project: '' + this.reportData.data.text_node_count,
                    },
                ];

                const errorData = [];

                for (let i = 0; i < this.reportData.data.success_report.length; i++) {
                    let success = '';
                    if (
                        this.reportData.data.success_report[i].font_availability == 'Success' &&
                        this.reportData.data.success_report[i].Lc_availability == 'Success' &&
                        (this.reportData.data.success_report[i].font_xml_id ||
                            this.reportData.data.success_report[i].font_name) &&
                        (this.reportData.data.success_report[i].lc_xml_name ||
                            this.reportData.data.success_report[i].Lc_name)
                    ) {
                        success = 'Font availability: Success'.concat(',', 'Lc availability: Success');
                    } else if (
                        this.reportData.data.success_report[i].Lc_availability == 'Success' &&
                        (this.reportData.data.success_report[i].lc_xml_name ||
                            this.reportData.data.success_report[i].Lc_name)
                    ) {
                        success = 'Lc availability: Success';
                    } else if (
                        this.reportData.data.success_report[i].font_availability == 'Success' &&
                        (this.reportData.data.success_report[i].font_xml_id ||
                            this.reportData.data.success_report[i].font_name)
                    ) {
                        success = 'Font availability: Success';
                    }

                    success = success.replace(/^,|,$/g, '');

                    this.reportData.data.success_report[i].message = success;
                }

                const createReportArr = [];
                for (let i = 0; i < this.reportData.data.complete_report.length; i++) {
                    const completeReportData = this.reportData.data.complete_report[i];
                    completeReportData.textNode_variant_no = completeReportData.textNode_variant_no || null;
                    const errorStatus = this.reportData?.data?.error_report.find(
                        (element) =>
                            element.textNode_id === completeReportData?.textNode_id &&
                            element.textNode_list_index === completeReportData?.textNode_list_index &&
                            element.textNode_variant_no === completeReportData?.textNode_variant_no
                    );

                    const warningStatus = this.reportData?.data?.warnings.find(
                        (element) =>
                            element.textNode_id === completeReportData?.textNode_id &&
                            element.textNode_list_index === completeReportData?.textNode_list_index &&
                            element.textNode_variant_no === completeReportData?.textNode_variant_no
                    );

                    const completReportxlx = {
                        Id: this.reportData.data.complete_report[i].textNode_id,
                        Name: this.reportData.data.complete_report[i].textNode_name,
                        'List Index': this.reportData.data.complete_report[i].textNode_list_index,
                        Source: this.reportData.data.complete_report[i].textNode_source,
                        Variant: this.reportData.data.complete_report[i].textNode_variant,
                        Label: this.reportData.data.complete_report[i].textNode_label,
                        'Font Name': this.reportData.data.complete_report[i].font_name,
                        'LengthCalculation Name': this.reportData.data.complete_report[i].Lc_name,
                        Error: errorStatus?.message,
                        Warning: warningStatus?.message,
                    };
                    createReportArr.push(completReportxlx);
                    if (errorStatus?.message) {
                        errorData.push(errorStatus.message);
                    }
                    if (warningStatus?.message) {
                        this.warningDataJson.push(warningStatus.message);
                    }
                }

                this.getWarningMessage();

                if (this.reportData) {
                    this.downloadExcel(
                        this.reportDataJson1,
                        createReportArr,
                        errorData,
                        this.warningDataJson,
                        this.downloadReportName,
                        this.warningReport
                    );
                }
                setTimeout(() => (this.loading = false), 2000);
            } else {
                this.downloadReportName = res.data.project_name;
                this.reportProjectuuId = res.data.existing_project_id;
                const languages = this.reportData.data.languages;
                const langs = languages?.join(', ');
                const fontsArr = this.reportData.data.fonts;
                const fonts = fontsArr?.join(', ');
                const variantsArr = this.reportData.data.variants;
                const variants = variantsArr?.join(', ');
                const LcData = this.reportData.data.Lc;
                const Lc = LcData?.join(', ');
                const versionNo = this.reportData.data.version_no;
                const string = versionNo?.toString();
                const Ver_No = string.substring(string.indexOf('.') + 1, string.length);
                this.reportDataJson1 = [
                    {
                        Attributes: 'Project Name',
                        Project: this.reportData.data.project_name,
                    },
                    {
                        Attributes: 'Project Id',
                        Project: '' + this.reportProjectuuId,
                    },
                    {
                        Attributes: 'Version No',
                        Project: '' + Ver_No,
                    },
                    {
                        Attributes: 'Brand',
                        Project: this.reportData.data.brand,
                    },
                    {
                        Attributes: 'Type',
                        Project: this.reportData.data.type,
                    },
                    {
                        Attributes: 'Description',
                        Project: this.reportData.data.description,
                    },
                    {
                        Attributes: 'Data Creation Date',
                        Project: newDate,
                    },
                    {
                        Attributes: 'Creator',
                        Project: this.reportData.data.creator,
                    },
                    {
                        Attributes: 'Languages (' + languages.length + ')',
                        Project: langs,
                    },
                    {
                        Attributes: 'Variants (' + variantsArr.length + ')',
                        Project: variants,
                    },
                    {
                        Attributes: 'Length Calculations (' + LcData.length + ')',
                        Project: Lc,
                    },
                    {
                        Attributes: 'Fonts (' + fontsArr.length + ')',
                        Project: fonts,
                    },
                    {
                        Attributes: 'Group Node Count',
                        Project: '' + this.reportData.data.group_node_count,
                    },
                    {
                        Attributes: 'Text Node Count',
                        Project: '' + this.reportData.data.text_node_count,
                    },
                ];

                const errorData = [];

                for (let i = 0; i < this.reportData.data.success_report.length; i++) {
                    const successDataforxl = {
                        'TextNode ID': this.reportData.data.success_report[i].textNode_id,
                        'Font Name': this.reportData.data.success_report[i].font_name,
                        'Font Availability': this.reportData.data.success_report[i].font_availability,
                        'LC Name': this.reportData.data.success_report[i].Lc_name,
                        'LC Availability': this.reportData.data.success_report[i].Lc_availability,
                    };
                    this.successDataJson.push(successDataforxl);
                }

                for (let i = 0; i < this.reportData.data?.data_difference.new_xml?.length; i++) {
                    let newDateGlobal = this.reportData?.data?.data_difference?.new_xml[i]?.date;
                    newDateGlobal = newDateGlobal?.substring(0, 10);
                    for (let j = 0; j < this.reportData.data.data_difference.old_xml.length; j++) {
                        let oldDateGlobal = this.reportData?.data?.data_difference?.old_xml[i]?.date;
                        oldDateGlobal = oldDateGlobal?.substring(0, 10);
                        let entries = '';
                        if (this.reportData.data.data_difference.change_entries) {
                            entries = this.reportData.data.data_difference.change_entries;
                        }
                        if (this.reportData.data.data_difference.structure_entries) {
                            entries = entries.concat(', ', this.reportData.data.data_difference.structure_entries);
                        }
                        this.projectUpdateReport = [
                            {
                                Attributes: 'Project Name',
                                Project_Old: this.reportData.data.data_difference.old_xml[j].title,
                                Project_New: this.reportData.data.data_difference.new_xml[i].title,
                            },
                            {
                                Attributes: 'Id',
                                Project_Old: this.reportData.data.data_difference.old_xml[j].id,
                                Project_New: this.reportData.data.data_difference.new_xml[i].id,
                            },
                            {
                                Attributes: 'Date',
                                Project_Old: oldDateGlobal,
                                Project_New: newDateGlobal,
                            },
                            {
                                Attributes: 'Languages (' + languages.length + ')',
                                Project_Old: this.reportData.data.data_difference.old_xml[j].language,
                                Project_New: this.reportData.data.data_difference.new_xml[i].language,
                            },
                            {
                                Attributes: 'Variants (' + variantsArr.length + ')',
                                Project_Old: this.reportData.data.data_difference.old_xml[j].variants,
                                Project_New: this.reportData.data.data_difference.new_xml[i].variants,
                            },
                            {
                                Attributes: 'Group Node Count',
                                Project_Old: '' + this.reportData.data.data_difference.old_xml[j].groupNodeCount,
                                Project_New: '' + this.reportData.data.data_difference.new_xml[i].groupNodeCount,
                                entries: entries,
                            },
                            {
                                Attributes: 'Text Node Count',
                                Project_Old: '' + this.reportData.data.data_difference.old_xml[j].textNodeCount,
                                Project_New: '' + this.reportData.data.data_difference.new_xml[i].textNodeCount,
                            },
                        ];
                    }
                }
                const newTextNodesArr = [];
                if (this.reportData.data.data_difference.new_text_nodes) {
                    const completeArr = this.reportData.data.complete_report;
                    const newArr = this.reportData.data.data_difference.new_text_nodes;
                    const result = completeArr.filter((o) =>
                        newArr.some(
                            ({ textNode_list_index, textNode_id }) =>
                                o.textNode_list_index === textNode_list_index && o.textNode_id === textNode_id
                        )
                    );

                    this.newTextnodelength = result;
                    if (result) {
                        for (let j = 0; j < result.length; j++) {
                            let success = '';
                            if (result[j].font_availability === 'success') {
                                success = 'Font availability: success';
                            }
                            result[j].message = success;
                            const errorStatus = this.reportData?.data?.error_report.find(
                                (element) => element.textNode_id === +result[j]?.textNode_id
                            );

                            const warningStatus = this.reportData?.data?.warnings.find(
                                (element) => element.textNode_id === +result[j]?.textNode_id
                            );

                            success = success.replace(/^,|,$/g, '');
                            const newTextNodeObj = {
                                Id: result[j].textNode_id,
                                Name: result[j].textNode_name,
                                Source: result[j].textNode_source,
                                Variant: result[j].textNode_variant,
                                'List Index': result[j].textNode_list_index,
                                Label: result[j].textNode_label,
                                Type: result[j].textNode_type ? result[j].textNode_type : 'Standard Text',
                                'Font Name': result[j].font_name,
                                'Length Calculation Name': result[j].Lc_name,
                                Error: errorStatus?.message,
                                Warning: warningStatus?.message,
                                'Max Width':
                                    this.reportData.data.data_difference.new_text_nodes[j].textNode_MaxWidth_new,
                                'Max Lines':
                                    this.reportData.data.data_difference.new_text_nodes[j].textNode_MaxLines_new,
                                'Line Break Mode':
                                    this.reportData.data.data_difference.new_text_nodes[j].textNode_Linebreak_new,
                            };
                            newTextNodesArr.push(newTextNodeObj);
                        }
                    }
                }
                const deletedTextNodesArr = [];
                if (this.reportData.data.data_difference.deleted_text_nodes) {
                    for (let i = 0; i < this.reportData.data.data_difference.deleted_text_nodes.length; i++) {
                        const deletedTextNodes = {
                            Id: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_id,
                            Name: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_name,
                            Type: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_type
                                ? this.reportData.data.data_difference.deleted_text_nodes[i].textNode_type
                                : 'Standard Text',
                            Variant: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_variant,
                            'List index':
                                this.reportData.data.data_difference.deleted_text_nodes[i].textNode_list_index,
                            Label: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_label,
                            Source: this.reportData.data.data_difference.deleted_text_nodes[i].textNode_source,
                        };
                        deletedTextNodesArr.push(deletedTextNodes);
                    }
                }
                const changeTextNodesArr = [];

                if (this.reportData.data.success_report.length != 0) {
                    for (let i = 0; i < this.reportData.data.success_report.length; i++) {
                        this.changeTextNodeSuccessData = '';
                        if (
                            this.reportData.data.success_report[i].font_availability == 'Success' &&
                            this.reportData.data.success_report[i].Lc_availability == 'Success' &&
                            (this.reportData.data.success_report[i].font_xml_id ||
                                this.reportData.data.success_report[i].font_name) &&
                            (this.reportData.data.success_report[i].lc_xml_name ||
                                this.reportData.data.success_report[i].Lc_name)
                        ) {
                            this.changeTextNodeSuccessData = 'Font availability: Success'.concat(
                                ',',
                                'Lc availability: Success'
                            );
                        } else if (
                            this.reportData.data.success_report[i].Lc_availability == 'Success' &&
                            (this.reportData.data.success_report[i].lc_xml_name ||
                                this.reportData.data.success_report[i].Lc_name)
                        ) {
                            this.changeTextNodeSuccessData = 'Lc availability: Success';
                        } else if (
                            this.reportData.data.success_report[i].font_availability == 'Success' &&
                            (this.reportData.data.success_report[i].font_xml_id ||
                                this.reportData.data.success_report[i].font_name)
                        ) {
                            this.changeTextNodeSuccessData = 'Font availability: Success';
                        }
                        this.changeTextNodeSuccessData = this.changeTextNodeSuccessData.replace(/^,|,$/g, '');

                        this.reportData.data.success_report[i].message = this.changeTextNodeSuccessData;
                    }
                }

                if (this.reportData.data.data_difference.changed_text_nodes) {
                    for (let i = 0; i < this.reportData.data.data_difference.changed_text_nodes.length; i++) {
                        const errorStatus = this.reportData?.data?.error_report.find(
                            (element) =>
                                element.textNode_id ===
                                this.reportData?.data?.data_difference?.changed_text_nodes[i]?.textNode_id
                        );

                        const warningStatus = this.reportData?.data?.warnings.find(
                            (element) =>
                                element.textNode_id ===
                                this.reportData?.data?.data_difference?.changed_text_nodes[i]?.textNode_id
                        );

                        const changeTextNodes = {
                            Id: this.reportData.data.data_difference.changed_text_nodes[i].textNode_id,
                            'Variant [Old]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_variant_id_old,
                            'Variant [New]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_variant_id_new,
                            'List index [Old]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_list_index_old,
                            'List index [New]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_list_index_new,
                            'Name [Old]': this.reportData.data.data_difference.changed_text_nodes[i].textNode_name_old,
                            'Name [New] ': this.reportData.data.data_difference.changed_text_nodes[i].textNode_name_new,
                            'Type [Old]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_type_old ??
                                'Standard Text',
                            'Type [New]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_type_new ??
                                'Standard Text',
                            Label: this.reportData.data.data_difference.changed_text_nodes[i].textNode_label,
                            'Source [Old]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_source_old,
                            'Source [New]':
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_source_new,
                            FontId_new: this.reportData.data.data_difference.changed_text_nodes[i].textNode_Font_Id_new,
                            FontId_old: this.reportData.data.data_difference.changed_text_nodes[i].textNode_Font_Id_old,
                            LcId_new: this.reportData.data.data_difference.changed_text_nodes[i].textNode_Lc_Id_new,
                            LcId_old: this.reportData.data.data_difference.changed_text_nodes[i].textNode_Lc_Id_old,
                            MaxWidth_new:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxWidth_new,
                            MaxWidth_old:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxWidth_old,
                            MaxLines_new:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxLines_new,
                            MaxLines_old:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxLines_old,
                            Linebreak_new:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_Linebreak_new,
                            Linebreak_old:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_Linebreak_old,
                            MaxCharacters_new:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxCharacters_new,
                            MaxCharacters_old:
                                this.reportData.data.data_difference.changed_text_nodes[i].textNode_MaxCharacters_old,
                            Error: errorStatus?.message,
                            Warning: warningStatus?.message,
                        };
                        changeTextNodesArr.push(changeTextNodes);
                    }
                }

                this.getWarningMessage();

                if (this.reportData) {
                    this.projectUpdateDownloadExcel(
                        this.reportDataJson1,
                        this.successDataJson,
                        newTextNodesArr,
                        errorData,
                        this.warningDataJson,
                        this.downloadReportName,
                        this.projectUpdateReport,
                        deletedTextNodesArr,
                        changeTextNodesArr,
                        this.warningReport
                    );
                }
                setTimeout(() => (this.loading = false), 2000);
            }
        });
    }
    downloadExcel(
        project: any[],
        createReportArr: any[],
        errorData: any[],
        warnings: any[],
        excelFileName: string,
        warningReport: WarningReportModel[]
    ) {
        const data = project;
        const report = createReportArr;

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Project');
        const columns = [];
        columns.push({ header: 'Attributes', width: 30 });
        columns.push({ header: 'Project', width: 50 });
        worksheet.columns = columns;

        const complete_report_worksheet = workbook.addWorksheet(
            'New text nodes' + '(' + this.reportData.data.complete_report.length + ')',
            {
                views: [{ state: 'frozen', xSplit: 4 }],
            }
        );
        const newtextColumn = [];
        newtextColumn.push({ header: 'Id', width: 20 });
        newtextColumn.push({ header: 'Name', width: 30 });
        newtextColumn.push({ header: 'List Index', width: 20 });
        newtextColumn.push({ header: 'Source', width: 40 });
        newtextColumn.push({ header: 'Variant', width: 30 });
        newtextColumn.push({ header: 'Label', width: 30 });
        newtextColumn.push({ header: 'Font Name', width: 40 });
        newtextColumn.push({ header: 'LengthCalculation Name', width: 40 });
        newtextColumn.push({ header: 'Error', width: 40 });
        newtextColumn.push({ header: 'Warning', width: 40 });
        complete_report_worksheet.columns = newtextColumn;

        for (const x1 of data) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            worksheet.addRow(temp);
        }
        for (const x1 of report) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            complete_report_worksheet.addRow(temp);
        }

        worksheet.addRow([]);
        this.warningReportWorksheet(warningReport, workbook);
        complete_report_worksheet.addRow([]);

        workbook.xlsx.writeBuffer().then((array: ArrayBuffer) => {
            const blob = new Blob([array], { type: EXCEL_TYPE });
            saveAs.saveAs(blob, excelFileName + EXCEL_EXTENSION);
        });
    }
    projectUpdateDownloadExcel(
        project: any[],
        success: any[],
        newTextNodesArr: any[],
        errorData: any[],
        warnings: any[],
        excelFileName: string,
        globalChanges: any[],
        deletedTextNodesArr: any[],
        changeTextNodesArr: any[],
        warningReport: WarningReportModel[]
    ) {
        const data = project;
        const newTextrRport = newTextNodesArr;
        const globalChangesReport = globalChanges;
        const detetedNodeReport = deletedTextNodesArr;
        const changeNodeReport = changeTextNodesArr;

        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Project');
        const columns = [];
        columns.push({ header: 'Attributes', width: 30 });
        columns.push({ header: 'Project', width: 50 });
        worksheet.columns = columns;

        const global_worksheet = workbook.addWorksheet('Global Changes');
        const globalcolumns = [];
        globalcolumns.push({ header: 'Attributes', width: 30 });
        globalcolumns.push({ header: 'Project [Old]', width: 50 });
        globalcolumns.push({ header: 'Project [New]', width: 50 });
        globalcolumns.push({ header: '', width: 50 });
        global_worksheet.columns = globalcolumns;

        if (this.reportData.data.data_difference.new_text_nodes) {
            const newTextNode_worksheet = workbook.addWorksheet(
                'New text nodes' + '(' + this.newTextnodelength.length + ')'
            );
            const newTextColumn = [];
            newTextColumn.push({ header: 'Id', width: 20 });
            newTextColumn.push({ header: 'Name', width: 30 });
            newTextColumn.push({ header: 'Source', width: 30 });
            newTextColumn.push({ header: 'Variant', width: 30 });
            newTextColumn.push({ header: 'List Index', width: 30 });
            newTextColumn.push({ header: 'Label', width: 30 });
            newTextColumn.push({ header: 'Type', width: 30 });
            newTextColumn.push({ header: 'Font Name', width: 40 });
            newTextColumn.push({ header: 'Length Calculation Name', width: 40 });
            newTextColumn.push({ header: 'Error', width: 40 });
            newTextColumn.push({ header: 'Warning', width: 40 });
            newTextColumn.push({ header: 'Max Width', width: 30 });
            newTextColumn.push({ header: 'Max Lines', width: 30 });
            newTextColumn.push({ header: 'Line Break Mode', width: 30 });
            newTextNode_worksheet.columns = newTextColumn;
            for (const x1 of newTextrRport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                newTextNode_worksheet.addRow(temp);
            }
            newTextNode_worksheet.addRow([]);
        } else {
            const newTextNode_worksheet = workbook.addWorksheet(
                'New text nodes' + '(' + !this.newTextnodelength
                    ? 'New text nodes(0)'
                    : this.newTextnodelength.length + ')'
            );
            const newTextColumn = [];
            newTextColumn.push({ header: 'Id', width: 20 });
            newTextColumn.push({ header: 'Name', width: 30 });
            newTextColumn.push({ header: 'Source', width: 30 });
            newTextColumn.push({ header: 'Variant', width: 30 });
            newTextColumn.push({ header: 'List Index', width: 30 });
            newTextColumn.push({ header: 'Label', width: 30 });
            newTextColumn.push({ header: 'Type', width: 30 });
            newTextColumn.push({ header: 'Font Name', width: 40 });
            newTextColumn.push({ header: 'Length Calculation Name', width: 40 });
            newTextColumn.push({ header: 'Error', width: 40 });
            newTextColumn.push({ header: 'Warning', width: 40 });
            newTextColumn.push({ header: 'Max Width', width: 30 });
            newTextColumn.push({ header: 'Max Lines', width: 30 });
            newTextColumn.push({ header: 'Line Break Mode', width: 30 });
            newTextNode_worksheet.columns = newTextColumn;
            for (const x1 of newTextrRport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                newTextNode_worksheet.addRow(temp);
            }
            newTextNode_worksheet.addRow([]);
        }
        if (this.reportData.data.data_difference.deleted_text_nodes) {
            const deleteNode_worksheet = workbook.addWorksheet(
                'Deleted text nodes' + '(' + this.reportData.data.data_difference.deleted_text_nodes.length + ')'
            );
            const deleteTextColumn = [];
            deleteTextColumn.push({ header: 'Id', width: 20 });
            deleteTextColumn.push({ header: 'Name', width: 30 });
            deleteTextColumn.push({ header: 'Type', width: 30 });
            deleteTextColumn.push({ header: 'Variant', width: 30 });
            deleteTextColumn.push({ header: 'List Index', width: 30 });
            deleteTextColumn.push({ header: 'Label', width: 30 });
            deleteTextColumn.push({ header: 'Source', width: 30 });
            deleteNode_worksheet.columns = deleteTextColumn;
            for (const x1 of detetedNodeReport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                deleteNode_worksheet.addRow(temp);
            }
            deleteNode_worksheet.addRow([]);
        } else {
            const deleteNode_worksheet = workbook.addWorksheet(
                'Deleted text nodes' + '(' + !this.reportData.data.data_difference.deleted_text_nodes
                    ? 'Deleted text nodes(0)'
                    : this.reportData.data.data_difference.deleted_text_nodes.length + ')'
            );
            const deleteTextColumn = [];
            deleteTextColumn.push({ header: 'Id', width: 20 });
            deleteTextColumn.push({ header: 'Name', width: 30 });
            deleteTextColumn.push({ header: 'Type', width: 30 });
            deleteTextColumn.push({ header: 'Variant', width: 30 });
            deleteTextColumn.push({ header: 'List Index', width: 30 });
            deleteTextColumn.push({ header: 'Label', width: 30 });
            deleteTextColumn.push({ header: 'Source', width: 30 });
            deleteNode_worksheet.columns = deleteTextColumn;
            for (const x1 of detetedNodeReport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                deleteNode_worksheet.addRow(temp);
            }
            deleteNode_worksheet.addRow([]);
        }
        if (this.reportData.data.data_difference.changed_text_nodes) {
            const changeNode_worksheet = workbook.addWorksheet(
                'Changed text nodes' + '(' + this.reportData.data.data_difference.changed_text_nodes.length + ')'
            );
            const changeTextColumn = [];
            changeTextColumn.push({ header: 'Id', width: 20 });
            changeTextColumn.push({ header: 'Variant [Old]', width: 30 });
            changeTextColumn.push({ header: 'Variant [New]', width: 30 });
            changeTextColumn.push({ header: 'List Index [Old]', width: 30 });
            changeTextColumn.push({ header: 'List Index [New]', width: 30 });
            changeTextColumn.push({ header: 'Name [Old]', width: 30 });
            changeTextColumn.push({ header: 'Name [New]', width: 30 });
            changeTextColumn.push({ header: 'Type [Old]', width: 30 });
            changeTextColumn.push({ header: 'Type [New]', width: 30 });
            changeTextColumn.push({ header: 'Label', width: 30 });
            changeTextColumn.push({ header: 'Source [Old]', width: 50 });
            changeTextColumn.push({ header: 'Source [New]', width: 50 });
            changeTextColumn.push({ header: 'FontId [New]', width: 20 });
            changeTextColumn.push({ header: 'FontId [OLd]', width: 30 });
            changeTextColumn.push({ header: 'LcId [New]', width: 30 });
            changeTextColumn.push({ header: 'LcId [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxWidth [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxWidth [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxLines [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxLines [Old]', width: 30 });
            changeTextColumn.push({ header: 'Linebreak [New]', width: 30 });
            changeTextColumn.push({ header: 'Linebreak [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxCharacters [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxCharacters [Old]', width: 30 });
            changeTextColumn.push({ header: 'Error', width: 30 });
            changeTextColumn.push({ header: 'Warning', width: 30 });
            changeNode_worksheet.columns = changeTextColumn;
            for (const x1 of changeNodeReport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                changeNode_worksheet.addRow(temp);
            }
            changeNode_worksheet.addRow([]);
        } else {
            const changeNode_worksheet = workbook.addWorksheet(
                'Changed text nodes' + '(' + !this.reportData.data.data_difference.changed_text_nodes
                    ? 'Changed text nodes(0)'
                    : this.reportData.data.data_difference.changed_text_nodes.length + ')'
            );
            const changeTextColumn = [];
            changeTextColumn.push({ header: 'Id', width: 20 });
            changeTextColumn.push({ header: 'Variant [Old]', width: 30 });
            changeTextColumn.push({ header: 'Variant [New]', width: 30 });
            changeTextColumn.push({ header: 'List Index [Old]', width: 30 });
            changeTextColumn.push({ header: 'List Index [New]', width: 30 });
            changeTextColumn.push({ header: 'Name [Old]', width: 30 });
            changeTextColumn.push({ header: 'Name [New]', width: 30 });
            changeTextColumn.push({ header: 'Type [Old]', width: 30 });
            changeTextColumn.push({ header: 'Type [New]', width: 30 });
            changeTextColumn.push({ header: 'Label', width: 30 });
            changeTextColumn.push({ header: 'Source [Old]', width: 50 });
            changeTextColumn.push({ header: 'Source [New]', width: 50 });
            changeTextColumn.push({ header: 'FontId [New]', width: 20 });
            changeTextColumn.push({ header: 'FontId [OLd]', width: 30 });
            changeTextColumn.push({ header: 'LcId [New]', width: 30 });
            changeTextColumn.push({ header: 'LcId [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxWidth [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxWidth [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxLines [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxLines [Old]', width: 30 });
            changeTextColumn.push({ header: 'Linebreak [New]', width: 30 });
            changeTextColumn.push({ header: 'Linebreak [Old]', width: 30 });
            changeTextColumn.push({ header: 'MaxCharacters [New]', width: 30 });
            changeTextColumn.push({ header: 'MaxCharacters [Old]', width: 30 });
            changeTextColumn.push({ header: 'Error', width: 30 });
            changeTextColumn.push({ header: 'Warning', width: 30 });
            changeNode_worksheet.columns = changeTextColumn;
            for (const x1 of changeNodeReport) {
                const x2 = Object.keys(x1);
                const temp = [];
                for (const y of x2) {
                    temp.push(x1[y]);
                }
                changeNode_worksheet.addRow(temp);
            }
            changeNode_worksheet.addRow([]);
        }
        for (const x1 of data) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            worksheet.addRow(temp);
        }
        for (const x1 of globalChangesReport) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            global_worksheet.addRow(temp);
        }
        worksheet.addRow([]);
        this.warningReportWorksheet(warningReport, workbook);
        global_worksheet.addRow([]);
        workbook.xlsx.writeBuffer().then((array: ArrayBuffer) => {
            //excel generation
            const blob = new Blob([array], { type: EXCEL_TYPE });
            saveAs.saveAs(blob, excelFileName + EXCEL_EXTENSION);
        });
    }
    downloadMappingAssistentReport(
        project: any[],
        createMappedReportArr: any[],
        createUnmappedReportArr: any[],
        createAmbiguousReportArr: any[],
        excelFileName: string
    ) {
        const data = project;
        const mappedReport = createMappedReportArr;
        const unmappedReport = createUnmappedReportArr;
        const ambiguousReport = createAmbiguousReportArr;

        const workbook = new Workbook();
        const mapOverviewworksheet = workbook.addWorksheet('Overview');

        const mapOverviewcolumns = [];
        mapOverviewcolumns.push({ header: 'Mapping Report', width: 30 });
        mapOverviewcolumns.push({ header: '', width: 30 });
        mapOverviewworksheet.columns = mapOverviewcolumns;

        const mappedworksheet = workbook.addWorksheet(
            'Mapped' + '(' + this.mappingAssistantResponse.data.complete_report[0].mapped.length + ')'
        );
        const mappedcolumns = [];
        mappedcolumns.push({ header: 'Id', width: 20 });
        mappedcolumns.push({ header: 'Property Name', width: 30 });
        mappedcolumns.push({ header: 'Variant', width: 20 });
        mappedcolumns.push({ header: 'List-Index', width: 30 });
        mappedcolumns.push({ header: 'Type', width: 30 });
        mappedcolumns.push({ header: 'Source Text', width: 30 });
        mappedcolumns.push({ header: 'Labels [old]', width: 30 });
        mappedcolumns.push({ header: 'Labels [new]', width: 30 });
        mappedcolumns.push({ header: 'Score', width: 30 });
        mappedcolumns.push({ header: 'Mapped STC Id', width: 30 });
        mappedcolumns.push({ header: 'Mapped form (ideal text or short form x)', width: 40 });
        mappedcolumns.push({ header: 'Mapping Ideal Text', width: 30 });
        mappedcolumns.push({ header: 'Editor Language [old]', width: 30 });
        mappedcolumns.push({ header: 'Editor Language [new after mapping]', width: 40 });
        mappedcolumns.push({ header: 'Editor Status [old]', width: 30 });
        mappedcolumns.push({ header: 'Editor Status [new]', width: 30 });
        mappedworksheet.columns = mappedcolumns;

        const notMappedworksheet = workbook.addWorksheet(
            'Not Mapped' + '(' + this.mappingAssistantResponse.data.complete_report[0].unmapped.length + ')'
        );
        const notMappedcolumns = [];
        notMappedcolumns.push({ header: 'Id', width: 20 });
        notMappedcolumns.push({ header: 'Property Name', width: 30 });
        notMappedcolumns.push({ header: 'Variant', width: 20 });
        notMappedcolumns.push({ header: 'List-Index', width: 30 });
        notMappedcolumns.push({ header: 'Type', width: 30 });
        notMappedcolumns.push({ header: 'Labels', width: 30 });
        notMappedcolumns.push({ header: 'Source Text', width: 30 });
        notMappedcolumns.push({ header: 'Score', width: 30 });
        notMappedcolumns.push({ header: 'Editor Language', width: 30 });
        notMappedcolumns.push({ header: 'Editor Status', width: 30 });
        notMappedcolumns.push({ header: 'Reason', width: 30 });
        notMappedworksheet.columns = notMappedcolumns;

        const ambigousworksheet = workbook.addWorksheet(
            'Ambiguous' + '(' + this.mappingAssistantResponse.data.complete_report[0].ambiguous.length + ')'
        );
        const ambigouscolumns = [];
        ambigouscolumns.push({ header: 'Id', width: 20 });
        ambigouscolumns.push({ header: 'Property Name', width: 30 });
        ambigouscolumns.push({ header: 'Variant', width: 20 });
        ambigouscolumns.push({ header: 'List-Index', width: 30 });
        ambigouscolumns.push({ header: 'Type', width: 30 });
        ambigouscolumns.push({ header: 'Labels [old]', width: 30 });
        ambigouscolumns.push({ header: 'Labels [new]', width: 30 });
        ambigouscolumns.push({ header: 'Source Text', width: 30 });
        ambigouscolumns.push({ header: 'Score', width: 20 });
        ambigouscolumns.push({ header: 'STC Id', width: 20 });
        ambigouscolumns.push({ header: 'Proposed Translation', width: 30 });
        ambigouscolumns.push({ header: 'Proposed form', width: 30 });
        ambigouscolumns.push({ header: 'Mapping Ideal Text', width: 30 });
        ambigouscolumns.push({ header: 'Editor Language', width: 30 });
        ambigouscolumns.push({ header: 'Editor Status', width: 30 });
        ambigousworksheet.columns = ambigouscolumns;

        for (const x1 of data) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            mapOverviewworksheet.addRow(temp);
        }
        for (const x1 of mappedReport) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            mappedworksheet.addRow(temp);
        }
        for (const x1 of unmappedReport) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            notMappedworksheet.addRow(temp);
        }
        for (const x1 of ambiguousReport) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            ambigousworksheet.addRow(temp);
        }

        mapOverviewworksheet.addRow([]);
        mappedworksheet.addRow([]);
        notMappedworksheet.addRow([]);
        ambigousworksheet.addRow([]);

        workbook.xlsx.writeBuffer().then((array: ArrayBuffer) => {
            const blob = new Blob([array], { type: EXCEL_TYPE });
            saveAs.saveAs(blob, excelFileName + EXCEL_EXTENSION);
        });
    }

    exportToMappingAssistantExcel(pid) {
        const project_Id = {
            project_id: pid,
        };
        this.exportToMapping(project_Id).subscribe((res) => {
            if (res.status === 'OK' && Object.keys(res?.data).length > 0) {
                this.mappingAssistantResponse = res;
                const mappingAssistentreportData = res.data;
                this.downloadReportName = res.data.project_name;
                this.getMappingOverviewData(mappingAssistentreportData).subscribe((mapresponse) => {
                    this.mappingReportDataJson = mapresponse.mappingReportDataJson;
                    const createMappedReportArr = mapresponse.createMappedReportArr;
                    const createUnmappedReportArr = mapresponse.createUnmappedReportArr;
                    const createAmbiguousReportArr = mapresponse.createAmbiguousReportArr;
                    this.downloadMappingAssistentReport(
                        this.mappingReportDataJson,
                        createMappedReportArr,
                        createUnmappedReportArr,
                        createAmbiguousReportArr,
                        this.downloadReportName
                    );
                    setTimeout(() => (this.loading = false), 2000);
                });
            }
        });
    }
    saveReport(status?, selectedProduct?, pid?, recalculateStatus?): void {
        if (status?.toLowerCase() == 'mapping assistent' || selectedProduct?.version_name?.startsWith('MA')) {
            this.isDisabledBtn = false;
            this.exportToMappingAssistantExcel(pid);
        } else {
            if (recalculateStatus == 'OK') {
                this.showHideButtons = false;
                this.hideButtons = true;
                this.downloadReport(pid);
            } else {
                this.loading = true;
                this.showHideButtons = true;
                this.hideButtons = false;
                this.isDisabledBtn = false;
                this.downloadReport(pid);
            }
        }
    }

    private getWarningMessage() {
        this.warningReport = [];
        this.reportData.data.logs.forEach((logs) => {
            const warningReportSheet = {
                Attributes: logs.attribute,
                Id: logs.id,
                Warnings: logs.logLevel === LogLevel.Warning ? logs.message : '',
                Errors: logs.logLevel === LogLevel.Error ? logs.message : '',
            };
            this.warningReport.push(warningReportSheet);
        });
    }

    private warningReportWorksheet(warning: WarningReportModel[], workbook: Workbook) {
        const warningWorksheet = workbook.addWorksheet('Errors and Warnings');
        const warningColumns = [];
        warningColumns.push(
            { header: 'Attributes', width: 20 },
            { header: 'Id', width: 10 },
            { header: 'Warnings', width: 30 },
            { header: 'Errors', width: 30 }
        );
        warningWorksheet.columns = warningColumns;

        for (const x1 of warning) {
            const x2 = Object.keys(x1);
            const temp = [];
            for (const y of x2) {
                temp.push(x1[y]);
            }
            warningWorksheet.addRow(temp);
        }
        warningWorksheet.addRow([]);
    }
}
