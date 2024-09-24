import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ExportService } from '../../core/services/export/export.service';
import { Xsltfile } from '../../shared/models/export/xsltfile';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ExportComponent implements OnInit {
    isPopupMaximized = false;
    @Input() export: boolean;
    @Output() hideExport: EventEmitter<any> = new EventEmitter();
    @Input() selectedProduct;
    versionNo = 0;
    slectedFile: Xsltfile;
    fileList: Xsltfile[];
    allLangFlag = 0;
    tabIndex = 0;
    exportDisable = false;
    filePreviewOrNot = false;
    previewXml = '';
    allLangXmlExportData = [];
    xml;
    msgs: Message[] = [];

    constructor(
        private eventBus: NgEventBus,
        private objExport: ExportService,
        private objExportService: ExportService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getXsltList();
        this.eventBus.on('excution:afterFileSelect').subscribe((data) => {
            this.filePreviewOrNot = false;
            this.previewXml = '';
            this.allLangXmlExportData = [];
            this.slectedFile = data['_data'];
        });
        this.eventBus.on('export:afterRename').subscribe(() => {
            this.getXsltList();
        });
        this.eventBus.on('eventExcution:afterSave').subscribe((data: any) => {
            this.messageService.add({ severity: 'success', summary: 'Info', detail: data?._data?.status });
            this.getXsltList();
            this.tabIndex = 0;
        });
        this.eventBus.on('eventExcution:afterCheckBoxClick').subscribe((data: any) => {
            this.allLangFlag = data?._data;
        });
        this.eventBus.on('eventExcution:afterExportSelect').subscribe((data: any) => {
            this.versionNo = data?._data?.version_no?.toString().split('.')[1];
        });
        this.eventBus.on('eventExcution:afterClickOnPreview').subscribe(() => {
            this.exportDisable = true;
            this.filePreviewOrNot = true;
            this.exportToXML('P');
        });
    }
    onMaximize() {
        this.isPopupMaximized = !this.isPopupMaximized;
    }

    hideExportPanel() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to cancel the Export?',
            header: 'Cancel Export',
            icon: 'pi pi-exclamation-triangle',
            key: 'cancelExport1',
            accept: () => {
                this.hideExport.emit();
            },
            reject: () => {
                this.msgs = [
                    {
                        severity: 'info',
                        summary: 'Rejected',
                        detail: 'You have rejected',
                    },
                ];
            },
        });
    }
    showExport() {
        this.hideExport.emit();
    }
    exportToXML(flag) {
        if (this.filePreviewOrNot && this.previewXml !== '' && this.allLangFlag === 0) {
            this.exportDisable = false;
            if (flag === 'P') {
                this.eventBus.cast('eventExcution:afterXmlGenerate', this.previewXml);
            } else {
                if (this.xml.length === 1) {
                    const blob = new Blob([this.previewXml], { type: '.xml' });
                    saveAs.saveAs(blob, this.selectedProduct.title + '.xml');
                } else {
                    this.downloadAllLang(this.xml, 'Xslt');
                }
            }
        } else if (this.filePreviewOrNot && this.allLangXmlExportData.length > 0 && this.allLangFlag === 1) {
            this.exportDisable = false;
            if (flag === 'P') {
                this.eventBus.cast('eventExcution:afterXmlGenerate', this.allLangXmlExportData[0].data);
            } else {
                this.downloadAllLang(this.allLangXmlExportData, 'Db');
            }
        } else {
            if (this.slectedFile) {
                const payload: any = {
                    xslt_id: this.slectedFile?.id,
                    project_id: this.selectedProduct.project_id,
                    version_id: this.selectedProduct.version_no,
                    title: this.selectedProduct.title,
                    allLangFlag: this.allLangFlag,
                };
                this.objExport
                    .getExportData(payload)
                    .pipe(catchError((error) => of(error)))
                    .subscribe((response: any) => {
                        if (response?.status === 'OK') {
                            if (this.allLangFlag === 0) {
                                this.xml = response.data.XsltXml;
                                if (this.xml.length > 0) {
                                    if (this.filePreviewOrNot) {
                                        this.previewXml = this.xml[0].data;
                                        this.exportDisable = false;
                                        this.eventBus.cast('eventExcution:afterXmlGenerate', this.previewXml);
                                    } else {
                                        if (this.xml?.length > 0) {
                                            this.downloadAllLang(this.xml, 'Xslt');
                                        } else {
                                            const blob = new Blob([this.xml], { type: '.xml' });
                                            saveAs.saveAs(blob, this.selectedProduct.title + '.xml');
                                        }
                                    }
                                } else {
                                    this.eventBus.cast('eventExcution:afterXmlGenerateError', '');
                                    this.exportDisable = false;
                                }
                            } else if (this.allLangFlag === 1) {
                                this.allLangXmlExportData = response.data.dbLanguageXml;
                                if (this.filePreviewOrNot) {
                                    this.exportDisable = false;
                                    this.eventBus.cast(
                                        'eventExcution:afterXmlGenerate',
                                        this.allLangXmlExportData[0].data
                                    );
                                } else {
                                    this.downloadAllLang(this.allLangXmlExportData, 'Db');
                                }
                            }
                        } else {
                            this.eventBus.cast('eventExcution:afterXmlGenerateError', '');
                            this.exportDisable = false;
                        }
                    });
            }
        }
    }
    getXsltList() {
        this.objExportService
            .getXsltList()
            .pipe(catchError((error) => of(error)))
            .subscribe((response: any) => {
                if (response?.status === 'OK') {
                    this.fileList = response.data;
                    this.slectedFile = response.data[0];
                    setTimeout(() => {
                        this.eventBus.cast('eventExcution:afterXSLTList', true);
                    }, 100);
                }
            });
    }
    onChangeTab(event) {
        if (event.index === 0) {
            this.tabIndex = 0;
        } else {
            this.tabIndex = 1;
            this.eventBus.cast('export:afterClickOnUploadXsltTab', '');
        }
    }
    downloadAllLang = async (allLangData, Name) => {
        const zip = new JSZip();
        const folderName = this.selectedProduct.title + '_' + this.slectedFile.xslt_name + '_' + Name;
        const allLangDataFile = allLangData?.data === undefined ? allLangData : allLangData?.data;
        allLangDataFile.forEach((element) => {
            const fileName = element.language;
            const xml = element.data;
            const blob = new Blob([xml], { type: '.xml' });
            const path = folderName + '/' + fileName + '.xml';
            zip.file(path, blob);
        });
        zip.generateAsync({ type: 'blob' }).then(function (content) {
            // see FileSaver.js
            const fileZipName = folderName + '.zip';
            saveAs(content, fileZipName);
        });
    };
    closeExport() {
        this.hideExport.emit();
    }
}
