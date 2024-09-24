import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ExportService } from 'src/app/core/services/export/export.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { Xsltfile } from 'src/app/shared/models/export/xsltfile';
@Component({
    selector: 'app-upload-xslt-file',
    templateUrl: './upload-xslt-file.component.html',
    styleUrls: ['./upload-xslt-file.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class UploadXsltFileComponent implements OnInit {
    hideCancelPopup = false;
    isFileSelected = false;
    loadingFileSpinner = false;
    fileSize;
    description = '';
    selectedFileName = '';
    uploadFileName = '';
    fileData;
    fileIsInvalid = false;
    ifFileExisit = false;
    @Output() hideExport: EventEmitter<any> = new EventEmitter();
    @Output() closeExport: EventEmitter<any> = new EventEmitter();
    @Input() fileList: Xsltfile[];
    @Input() selectedProduct;
    fileError = '';
    msgs: Message[] = [];
    constructor(
        private exportService: ExportService,
        private eventBus: NgEventBus,
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.eventBus.on('export:afterClickOnUploadXsltTab').subscribe(() => {
            this.clearTheFileDetails(0);
        });
    }
    hideCancel() {
        this.hideCancelPopup = false;
    }
    showCancel() {
        this.isFileSelected = false;
        this.hideCancelPopup = true;
    }
    uploadFile(event: any) {
        const ifCheckSameFileUpload = this.fileList.find(
            (item) => item.xslt_name.trim() === event.files[0].name.split('.')[0].trim()
        );
        if (ifCheckSameFileUpload) {
            this.ifFileExisit = true;
            this.fileError = 'File is already present,Please upload another file';
        } else {
            this.fileError = '';
            this.ifFileExisit = false;
            this.uploadDocument(event.files[0]);
        }
        this.isFileSelected = true;
    }
    uploadDocument(file) {
        const fileReader = new FileReader();
        this.uploadFileName = file.name?.split('.')[0];

        try {
            fileReader.onload = () => {
                this.fileData = fileReader.result;
            };
            fileReader.readAsText(file);
        } catch (error) {
            this.fileIsInvalid = true;
        }
    }
    saveExportFile() {
        if (this.fileData && this.uploadFileName) {
            const payload: any = {
                xslt_description: this.description,
                user_id: this.userService.getUser().id,
                xslt_name: this.uploadFileName,
                xslt_file: this.fileData,
                project_id: this.selectedProduct.project_id,
                version_id: this.selectedProduct.version_no,
                title: this.selectedProduct.title,
            };

            this.exportService
                .saveExportXslt(payload)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response: any) => {
                    if (response?.status === 'OK') {
                        if (response.data.status === 'File exists') {
                            this.ifFileExisit = true;
                            this.fileError = 'File is already present,Please upload another file';
                        } else {
                            this.clearTheFileDetails(1);
                            this.eventBus.cast('eventExcution:afterSave', response.data);
                        }
                    } else if (response?.status === 'NOK') {
                        this.ifFileExisit = true;
                        this.fileError = response.data;
                    }
                });
        }
    }
    hideExportPanel() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to cancel the Export?',
            header: 'Cancel Export',
            icon: 'pi pi-times',
            key: 'cancelExport',
            accept: () => {
                this.closeExport.emit();
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
    clearTheFileDetails(flag) {
        if (flag === 1) {
            document.getElementsByClassName('p-fileupload-row')[0].children[1].innerHTML = '';
            document.getElementsByClassName('p-fileupload-row')[0].children[2].innerHTML = '';
            this.isFileSelected = false;
            this.selectedFileName = '';
            this.fileSize = '';
            this.description = '';
            this.ifFileExisit = false;
            this.fileData = '';
            this.fileError = '';
        }
    }
}
