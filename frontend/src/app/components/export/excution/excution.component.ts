import { Component, Input, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ExportService } from 'src/app/core/services/export/export.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Xsltfile } from 'src/app/shared/models/export/xsltfile';

@Component({
    selector: 'app-excution',
    templateUrl: './excution.component.html',
    styleUrls: ['./excution.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class ExcutionComponent implements OnInit {
    @Input() fileList: Xsltfile[];
    selectedFileName: Xsltfile;
    renamePanelOpen = false;
    newRenameFile = '';
    slectedFile;
    fileNameExsist = false;
    xsltLines = [];
    @Input() selectedProduct;
    ifProjectWarning = false;
    projectValidationMessage;
    msgs: Message[] = [];
    zipDownload = false;
    activePrivewTab = false;
    loading = false;
    prievewData = '';
    constructor(
        private objExportService: ExportService,
        private messageService: MessageService,
        private eventBus: NgEventBus,
        private userService: UserService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('eventExcution:afterXSLTList').subscribe(() => {
            this.selectedFileName = this.fileList[0];
        });
        this.eventBus.on('eventExcution:afterExportSelect').subscribe(() => {
            this.activePrivewTab = false;
            this.checkIfAnyProjectErrorAndPendingTranslation();
        });
        this.eventBus.on('eventExcution:afterXmlGenerate').subscribe((data: any) => {
            this.loading = false;
            this.xsltLines = data?._data?.split('<').splice(0, 21);
            this.activePrivewTab = true;
        });
        this.eventBus.on('eventExcution:afterXmlGenerateError').subscribe(() => {
            this.loading = false;
        });
    }
    deleteFile(): void {
        if (this.selectedFileName) {
            const payload: any = {
                xslt_id: this.selectedFileName.id,
            };
            if (payload) {
                this.objExportService
                    .deleteFile(payload)
                    .pipe(catchError(() => of(undefined)))
                    .subscribe((response: any) => {
                        if (response?.status === 'OK') {
                            this.xsltLines = [];
                            this.selectedFileName = undefined;
                            this.activePrivewTab = false;
                            this.eventBus.cast('export:afterRename', '');
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Info',
                                detail: 'Delete File sucessfully.',
                            });
                        }
                    });
            }
        }
    }

    renameFileName() {
        this.renamePanelOpen = true;
    }
    renameAndSaveFileName() {
        if (this.selectedFileName) {
            if (this.newRenameFile.trim() != '') {
                const ifCheckExistingFileName = this.fileList.find(
                    (item) => item.xslt_name.trim() === this.newRenameFile.trim()
                );
                if (ifCheckExistingFileName === undefined) {
                    this.payloadForRenameAndSave();
                } else {
                    this.fileNameExsist = true;
                }
            }
        }
    }

    payloadForRenameAndSave() {
        const payload: any = {
            xslt_id: this.selectedFileName.id,
            xslt_name: this.newRenameFile,
            user_id: this.userService.getUser()?.id,
        };
        if (payload) {
            this.objExportService
                .renameFileName(payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response: any) => {
                    if (response?.status === 'OK') {
                        this.eventBus.cast('export:afterRename', '');
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Info',
                            detail: 'Files successfully renamed.',
                        });
                        this.newRenameFile = '';
                        this.renamePanelOpen = false;
                        this.fileNameExsist = false;
                    }
                });
        }
    }

    selectFile(e) {
        this.loading = false;
        this.activePrivewTab = false;
        this.selectedFileName = e.value;
        this.eventBus.cast('excution:afterFileSelect', this.selectedFileName);
    }
    getXsltFileDataByXsltId(id) {
        const payload: any = {
            xslt_id: id,
        };
        this.objExportService
            .getFileData(payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: any) => {
                if (response?.status === 'OK') {
                    const splitDataByLines = response.data[0].xslt_file.split('\n');
                    this.xsltLines = splitDataByLines?.slice(0, 20);
                }
            });
    }
    checkIfAnyProjectErrorAndPendingTranslation() {
        const payload: any = {
            project_id: this.selectedProduct.project_id,
            version_id: this.selectedProduct.version_no,
        };
        if (payload) {
            this.objExportService
                .checkProjectErrorAndPendingTranslation(payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response: any) => {
                    if (response?.status === 'OK') {
                        this.ifProjectWarning = true;
                        this.projectValidationMessage = response.data;
                    }
                });
        }
    }
    deleteXsltFile() {
        if (this.selectedFileName) {
            this.confirmationService.confirm({
                message: `Are you sure you want to delete the selected File "${this.selectedFileName.xslt_name}"?`,
                header: 'Delete Export File',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.deleteFile();
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
    }
    onCheckBox() {
        this.activePrivewTab = false;
        this.eventBus.cast('eventExcution:afterCheckBoxClick', this.zipDownload ? 1 : 0);
    }
    onPreviewOpen() {
        if (this.fileList?.length > 0) {
            this.loading = true;
            this.eventBus.cast('eventExcution:afterClickOnPreview', '');
        }
    }
}
